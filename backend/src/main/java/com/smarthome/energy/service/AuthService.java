package com.smarthome.energy.service;

import com.smarthome.energy.dto.*;
import com.smarthome.energy.model.ERole;
import com.smarthome.energy.model.EmailVerificationOtp;
import com.smarthome.energy.model.Role;
import com.smarthome.energy.model.User;
import com.smarthome.energy.repository.EmailVerificationOtpRepository;
import com.smarthome.energy.repository.RoleRepository;
import com.smarthome.energy.repository.UserRepository;
import com.smarthome.energy.security.jwt.JwtUtils;
import com.smarthome.energy.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailVerificationOtpRepository otpRepository;

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Check if email is verified
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email before logging in.");
        }

        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    public MessageResponse register(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            roles.add(getOrCreateRole(ERole.ROLE_HOMEOWNER));
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        roles.add(getOrCreateRole(ERole.ROLE_ADMIN));
                        break;
                    case "technician":
                        roles.add(getOrCreateRole(ERole.ROLE_TECHNICIAN));
                        break;
                    default:
                        roles.add(getOrCreateRole(ERole.ROLE_HOMEOWNER));
                }
            });
        }

        user.setRoles(roles);
        user.setEmailVerified(false); // Email not verified yet
        userRepository.save(user);

        // Generate 6-digit OTP
        String otp = generateOtp();

        // Create OTP record with 15-minute expiry
        EmailVerificationOtp otpRecord = new EmailVerificationOtp(
                user.getEmail(),
                otp,
                LocalDateTime.now().plusMinutes(15));
        otpRepository.save(otpRecord);

        // Send OTP email
        boolean emailSent = emailService.sendOtpEmail(user.getEmail(), otp);

        if (!emailSent) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                    .warn("Failed to send OTP email to: {}", user.getEmail());
        } else {
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                    .info("OTP email sent successfully to: {}", user.getEmail());
        }

        return new MessageResponse("User registered successfully! Please check your email for verification code.");
    }

    private Role getOrCreateRole(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        try {
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                try {
                    // Generate secure reset token (UUID)
                    String token = java.util.UUID.randomUUID().toString();

                    // Store token and set 15-minute expiry
                    user.setResetToken(token);
                    user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
                    userRepository.save(user);

                    // Attempt to send reset email
                    boolean emailSent = emailService.sendResetEmail(user.getEmail(), token);

                    if (emailSent) {
                        org.slf4j.LoggerFactory.getLogger(AuthService.class)
                                .info("Password reset email sent to: {}", user.getEmail());
                    } else {
                        org.slf4j.LoggerFactory.getLogger(AuthService.class)
                                .warn("Failed to send password reset email to: {}", user.getEmail());
                    }
                } catch (Exception e) {
                    org.slf4j.LoggerFactory.getLogger(AuthService.class)
                            .error("Error processing forgot password for email: {}. Error: {}",
                                    request.getEmail(), e.getMessage());
                }
            });

            // Always return generic message to prevent email enumeration
            return new MessageResponse(
                    "If this email exists in our system, you will receive a password reset link within the next few minutes.");
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                    .error("Error in forgotPassword flow: {}", e.getMessage(), e);
            // Still return generic message even on error
            return new MessageResponse(
                    "If this email exists in our system, you will receive a password reset link within the next few minutes.");
        }
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Check if token has expired
        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Update password
        user.setPasswordHash(encoder.encode(request.getNewPassword()));

        // Clear reset token
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return new MessageResponse("Password has been reset successfully");
    }

    /**
     * Verifies the OTP for email verification and returns JWT token
     * 
     * @param email - User's email address
     * @param otp   - The OTP code to verify
     * @return JwtResponse with token for auto-login
     */
    @Transactional
    public JwtResponse verifyEmailOtp(String email, String otp) {
        // Find the OTP record
        EmailVerificationOtp otpRecord = otpRepository.findByEmailAndOtpAndVerifiedFalse(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP code"));

        // Check if OTP has expired
        if (otpRecord.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Mark email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Delete the used OTP
        otpRepository.delete(otpRecord);

        // Generate JWT token for auto-login
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String jwt = jwtUtils.generateTokenFromUsername(userDetails.getUsername());

        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles);
    }

    /**
     * Resends a new OTP to the user's email
     * 
     * @param email - User's email address
     */
    public void resendOtp(String email) {
        // Verify user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Check if email is already verified
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate new 6-digit OTP
        String otp = generateOtp();

        // Create new OTP record with 15-minute expiry
        EmailVerificationOtp otpRecord = new EmailVerificationOtp(
                email,
                otp,
                LocalDateTime.now().plusMinutes(15));
        otpRepository.save(otpRecord);

        // Send OTP email
        boolean emailSent = emailService.sendOtpEmail(email, otp);

        if (!emailSent) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                    .warn("Failed to send OTP email to: {}", email);
        }
    }

    /**
     * Generates a random 6-digit OTP
     * 
     * @return 6-digit OTP as String
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Generates 6-digit number
        return String.valueOf(otp);
    }

    /**
     * Process OAuth2 login - only allow login if user already exists
     * Do NOT automatically create accounts for unregistered Google users
     * 
     * @param oauth2User OAuth2 user details
     * @param provider   OAuth provider name (google, facebook, etc.)
     * @return JWT token for the authenticated user
     * @throws RuntimeException if email does not exist in database
     */
    @Transactional
    public String processOAuthPostLogin(org.springframework.security.oauth2.core.user.OAuth2User oauth2User,
            String provider) {
        String email = oauth2User.getAttribute("email");
        String oauthId = oauth2User.getAttribute("sub"); // Google's unique user ID
        String profilePicture = oauth2User.getAttribute("picture");

        // Check if user exists - REQUIRED for OAuth login
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (!existingUser.isPresent()) {
            // User does not exist - deny login
            // Do NOT auto-create accounts for Google Sign-In
            throw new RuntimeException("Account not found. Please register first before signing in with Google.");
        }

        User user = existingUser.get();

        // Update OAuth info if not already set
        if (user.getOauthProvider() == null || !user.getOauthProvider().equals(provider)) {
            user.setOauthProvider(provider);
            user.setOauthId(oauthId);
            user.setProfilePictureUrl(profilePicture);
            userRepository.save(user);
        }

        // Check if email is verified
        if (!user.isEmailVerified()) {
            // Generate and send OTP for email verification
            String otp = generateOtp();
            EmailVerificationOtp otpRecord = new EmailVerificationOtp(
                    user.getEmail(),
                    otp,
                    LocalDateTime.now().plusMinutes(15));
            otpRepository.save(otpRecord);

            boolean emailSent = emailService.sendOtpEmail(user.getEmail(), otp);
            if (emailSent) {
                org.slf4j.LoggerFactory.getLogger(AuthService.class)
                        .info("OTP email sent to unverified OAuth user: {}", user.getEmail());
            }

            // Return special token indicating OTP verification is needed
            return "OTP_REQUIRED:" + email;
        }

        // User is already verified and exists, generate JWT token
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        return jwtUtils.generateTokenFromUsername(userDetails.getUsername());
    }

    /**
     * Check if an email exists in the database
     * Used for pre-validation before OAuth login or for frontend checks
     * 
     * @param email - Email address to check
     * @return true if email exists, false otherwise
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
