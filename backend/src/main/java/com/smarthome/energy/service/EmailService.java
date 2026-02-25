package com.smarthome.energy.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${smarthome.app.frontendBaseUrl:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public boolean sendResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Smart Home Energy Management");
            String resetLink = buildResetLink(token);
            message.setText("Hello,\n\n" +
                    "You requested a password reset for your Smart Home Energy Management account.\n\n" +
                    "To reset your password, click the link below:\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 15 minutes.\n\n" +
                    "If you did not request this reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Smart Home Energy Management Team");

            // Check if JavaMailSender is available (SMTP configured)
            if (mailSender != null) {
                try {
                    mailSender.send(message);
                    logger.info("Password reset email sent successfully to: {}", toEmail);
                    System.out.println("\n✓ EMAIL SENT: Password reset link sent to " + toEmail);
                    return true;
                } catch (Exception e) {
                    logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
                    System.out.println("\n✗ EMAIL FAILED: " + e.getMessage());
                    return false;
                }
            } else {
                // SMTP not configured, log to console for development
                logger.info("JavaMailSender not configured. Logging reset token to console for development.");
                System.out.println("\n=== PASSWORD RESET EMAIL (CONSOLE LOG) ===");
                System.out.println("To: " + toEmail);
                System.out.println("Subject: " + message.getSubject());
                System.out.println("Reset Token: " + token);
                System.out.println("Reset Link: " + resetLink);
                System.out.println("Expiry: 15 minutes");
                System.out.println("=========================================\n");
                logger.info("Password reset token generated for: {} (SMTP not configured)", toEmail);
                return true; // Treat console logging as success for development
            }
        } catch (Exception e) {
            logger.error("Unexpected error in sendResetEmail: {}", e.getMessage(), e);
            System.out.println("\n✗ UNEXPECTED ERROR: " + e.getMessage());
            return false;
        }
    }

    private String buildResetLink(String token) {
        String base = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/reset-password?token=" + token;
    }

    public boolean sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Email Verification - Smart Home Energy Management");
            message.setText("Hello,\n\n" +
                    "Thank you for registering with Smart Home Energy Management!\n\n" +
                    "Your verification code is: " + otp + "\n\n" +
                    "This code will expire in 15 minutes.\n\n" +
                    "If you did not request this verification, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Smart Home Energy Management Team");

            // Check if JavaMailSender is available (SMTP configured)
            if (mailSender != null) {
                try {
                    mailSender.send(message);
                    logger.info("OTP verification email sent successfully to: {}", toEmail);
                    System.out.println("\n✓ EMAIL SENT: OTP verification sent to " + toEmail);
                    return true;
                } catch (Exception e) {
                    logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
                    System.out.println("\n✗ EMAIL FAILED: " + e.getMessage());
                    return false;
                }
            } else {
                // SMTP not configured, log to console for development
                logger.info("JavaMailSender not configured. Logging OTP to console for development.");
                System.out.println("\n=== OTP VERIFICATION EMAIL (CONSOLE LOG) ===");
                System.out.println("To: " + toEmail);
                System.out.println("Subject: " + message.getSubject());
                System.out.println("OTP Code: " + otp);
                System.out.println("Expiry: 15 minutes");
                System.out.println("===========================================\n");
                logger.info("OTP generated for: {} (SMTP not configured)", toEmail);
                return true; // Treat console logging as success for development
            }
        } catch (Exception e) {
            logger.error("Unexpected error in sendOtpEmail: {}", e.getMessage(), e);
            System.out.println("\n✗ UNEXPECTED ERROR: " + e.getMessage());
            return false;
        }
    }
}
