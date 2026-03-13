package com.smarthome.energy.service;

import com.smarthome.energy.dto.*;
import com.smarthome.energy.model.*;
import com.smarthome.energy.repository.EmailVerificationOtpRepository;
import com.smarthome.energy.repository.RoleRepository;
import com.smarthome.energy.repository.UserRepository;
import com.smarthome.energy.security.jwt.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    AuthenticationManager authenticationManager;
    @Mock
    UserRepository userRepository;
    @Mock
    RoleRepository roleRepository;
    @Mock
    PasswordEncoder encoder;
    @Mock
    JwtUtils jwtUtils;
    @Mock
    EmailService emailService;
    @Mock
    EmailVerificationOtpRepository otpRepository;

    @InjectMocks
    AuthService authService;

    // ═══════════════════════════════════════════════════════════════════════════
    // register()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("register()")
    class RegisterTests {

        private SignupRequest validRequest() {
            SignupRequest req = new SignupRequest();
            req.setFirstName("John");
            req.setLastName("Doe");
            req.setUsername("johndoe");
            req.setEmail("john@example.com");
            req.setPassword("Secret123");
            return req;
        }

        @Test
        @DisplayName("Registers user and sends OTP email on success")
        void registersSuccessfully() {
            when(userRepository.existsByUsername("johndoe")).thenReturn(false);
            when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
            when(encoder.encode(any())).thenReturn("$encoded$");

            Role role = new Role(ERole.ROLE_HOMEOWNER);
            when(roleRepository.findByName(ERole.ROLE_HOMEOWNER)).thenReturn(Optional.of(role));

            User savedUser = new User();
            savedUser.setEmail("john@example.com");
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            when(emailService.sendOtpEmail(anyString(), anyString())).thenReturn(true);

            MessageResponse response = authService.register(validRequest());

            assertThat(response.getMessage()).containsIgnoringCase("registered successfully");
            verify(userRepository).save(any(User.class));
            verify(otpRepository).save(any(EmailVerificationOtp.class));
            verify(emailService).sendOtpEmail(eq("john@example.com"), anyString());
        }

        @Test
        @DisplayName("Throws when username already taken")
        void throwsWhenUsernameExists() {
            when(userRepository.existsByUsername("johndoe")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(validRequest()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Username is already taken");
        }

        @Test
        @DisplayName("Throws when email already in use")
        void throwsWhenEmailExists() {
            when(userRepository.existsByUsername("johndoe")).thenReturn(false);
            when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(validRequest()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Email is already in use");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // resetPassword()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("resetPassword()")
    class ResetPasswordTests {

        @Test
        @DisplayName("Resets password when token is valid and not expired")
        void resetsPasswordSuccessfully() {
            User user = new User();
            user.setResetToken("valid-token");
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));

            when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
            when(encoder.encode("NewPass1!")).thenReturn("$newEncoded$");
            when(userRepository.save(any())).thenReturn(user);

            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("valid-token");
            req.setNewPassword("NewPass1!");

            MessageResponse resp = authService.resetPassword(req);

            assertThat(resp.getMessage()).containsIgnoringCase("reset successfully");
            assertThat(user.getResetToken()).isNull();
            assertThat(user.getResetTokenExpiry()).isNull();
            verify(encoder).encode("NewPass1!");
        }

        @Test
        @DisplayName("Throws when reset token is invalid/missing")
        void throwsOnInvalidToken() {
            when(userRepository.findByResetToken("bad-token")).thenReturn(Optional.empty());

            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("bad-token");
            req.setNewPassword("pass");

            assertThatThrownBy(() -> authService.resetPassword(req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid or expired reset token");
        }

        @Test
        @DisplayName("Throws when token is expired")
        void throwsWhenTokenExpired() {
            User user = new User();
            user.setResetToken("old-token");
            user.setResetTokenExpiry(LocalDateTime.now().minusMinutes(1));

            when(userRepository.findByResetToken("old-token")).thenReturn(Optional.of(user));

            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("old-token");
            req.setNewPassword("pass");

            assertThatThrownBy(() -> authService.resetPassword(req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("expired");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // forgotPassword()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("forgotPassword()")
    class ForgotPasswordTests {

        @Test
        @DisplayName("Returns generic message when email is not registered")
        void returnsGenericResponseForUnknownEmail() {
            when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

            ForgotPasswordRequest req = new ForgotPasswordRequest();
            req.setEmail("unknown@test.com");

            MessageResponse resp = authService.forgotPassword(req);

            assertThat(resp.getMessage()).contains("If this email exists");
        }

        @Test
        @DisplayName("Sends reset email and returns generic message when email is registered")
        void sendsEmailWhenUserExists() {
            User user = new User();
            user.setEmail("real@test.com");

            when(userRepository.findByEmail("real@test.com")).thenReturn(Optional.of(user));
            when(userRepository.save(any())).thenReturn(user);
            when(emailService.sendResetEmail(anyString(), anyString())).thenReturn(true);

            ForgotPasswordRequest req = new ForgotPasswordRequest();
            req.setEmail("real@test.com");

            MessageResponse resp = authService.forgotPassword(req);

            verify(emailService).sendResetEmail(eq("real@test.com"), anyString());
            assertThat(resp.getMessage()).contains("If this email exists");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // verifyEmailOtp()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("verifyEmailOtp()")
    class VerifyOtpTests {

        @Test
        @DisplayName("Throws when OTP is not found")
        void throwsOnInvalidOtp() {
            when(otpRepository.findByEmailAndOtpAndVerifiedFalse("a@b.com", "000000"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.verifyEmailOtp("a@b.com", "000000"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid OTP");
        }

        @Test
        @DisplayName("Throws when OTP is expired")
        void throwsWhenOtpExpired() {
            EmailVerificationOtp otp = new EmailVerificationOtp(
                    "a@b.com", "123456", LocalDateTime.now().minusMinutes(1));
            when(otpRepository.findByEmailAndOtpAndVerifiedFalse("a@b.com", "123456"))
                    .thenReturn(Optional.of(otp));

            assertThatThrownBy(() -> authService.verifyEmailOtp("a@b.com", "123456"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("expired");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // emailExists()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("emailExists()")
    class EmailExistsTests {

        @Test
        @DisplayName("Returns true when email is registered")
        void returnsTrueWhenEmailExists() {
            when(userRepository.existsByEmail("exists@test.com")).thenReturn(true);
            assertThat(authService.emailExists("exists@test.com")).isTrue();
        }

        @Test
        @DisplayName("Returns false when email is not registered")
        void returnsFalseWhenEmailNotExists() {
            when(userRepository.existsByEmail("none@test.com")).thenReturn(false);
            assertThat(authService.emailExists("none@test.com")).isFalse();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // resendOtp()
    // ═══════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("resendOtp()")
    class ResendOtpTests {

        @Test
        @DisplayName("Throws when email is not found in database")
        void throwsWhenEmailNotFound() {
            when(userRepository.findByEmail("no@x.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resendOtp("no@x.com"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Email not found");
        }

        @Test
        @DisplayName("Throws when email is already verified")
        void throwsWhenAlreadyVerified() {
            User user = new User();
            user.setEmailVerified(true);
            when(userRepository.findByEmail("verified@x.com")).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> authService.resendOtp("verified@x.com"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("already verified");
        }
    }
}
