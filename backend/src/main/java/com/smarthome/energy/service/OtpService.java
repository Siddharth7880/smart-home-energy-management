package com.smarthome.energy.service;

import com.smarthome.energy.model.EmailVerificationOtp;
import com.smarthome.energy.repository.EmailVerificationOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private static final int OTP_EXPIRY_MINUTES = 15;
    private static final SecureRandom random = new SecureRandom();

    @Autowired
    private EmailVerificationOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Generate a 6-digit OTP and send it via email
     */
    @Transactional
    public String generateAndSendOtp(String email) {
        // Delete any existing OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = generateOtp();

        // Create OTP record
        EmailVerificationOtp otpRecord = new EmailVerificationOtp(
                email,
                otp,
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

        otpRepository.save(otpRecord);

        // Send OTP via email
        boolean emailSent = emailService.sendOtpEmail(email, otp);

        if (emailSent) {
            logger.info("OTP generated and sent successfully to: {}", email);
        } else {
            logger.warn("OTP generated but email sending failed for: {}", email);
        }

        return otp;
    }

    /**
     * Verify OTP for the given email
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        Optional<EmailVerificationOtp> otpRecordOpt = otpRepository
                .findByEmailAndOtpAndVerifiedFalse(email, otp);

        if (otpRecordOpt.isEmpty()) {
            logger.warn("Invalid OTP attempt for email: {}", email);
            return false;
        }

        EmailVerificationOtp otpRecord = otpRecordOpt.get();

        // Check if OTP has expired
        if (otpRecord.isExpired()) {
            logger.warn("Expired OTP attempt for email: {}", email);
            return false;
        }

        // Mark as verified
        otpRecord.setVerified(true);
        otpRepository.save(otpRecord);

        logger.info("OTP verified successfully for email: {}", email);
        return true;
    }

    /**
     * Resend OTP to the given email
     */
    @Transactional
    public String resendOtp(String email) {
        logger.info("Resending OTP to email: {}", email);
        return generateAndSendOtp(email);
    }

    /**
     * Generate a random 6-digit OTP
     */
    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Scheduled task to clean up expired OTPs (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            var expiredOtps = otpRepository.findByExpiryTimeBefore(LocalDateTime.now());
            if (!expiredOtps.isEmpty()) {
                otpRepository.deleteAll(expiredOtps);
                logger.info("Cleaned up {} expired OTP records", expiredOtps.size());
            }
        } catch (Exception e) {
            logger.error("Error cleaning up expired OTPs: {}", e.getMessage(), e);
        }
    }
}
