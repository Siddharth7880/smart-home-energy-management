package com.smarthome.energy.repository;

import com.smarthome.energy.model.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findByEmailAndOtpAndVerifiedFalse(String email, String otp);

    Optional<EmailVerificationOtp> findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(String email);

    List<EmailVerificationOtp> findByExpiryTimeBefore(LocalDateTime dateTime);

    void deleteByEmail(String email);
}
