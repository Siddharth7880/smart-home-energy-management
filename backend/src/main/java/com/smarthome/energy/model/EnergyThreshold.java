package com.smarthome.energy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "energy_thresholds")
public class EnergyThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "threshold_kwh", nullable = false)
    private Double thresholdKwh = 10.0; // default 10 kWh per day

    @Column(name = "email_notification", nullable = false)
    private boolean emailNotification = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public EnergyThreshold() {}

    // ── Getters & Setters ─────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getThresholdKwh() { return thresholdKwh; }
    public void setThresholdKwh(Double thresholdKwh) { this.thresholdKwh = thresholdKwh; }

    public boolean isEmailNotification() { return emailNotification; }
    public void setEmailNotification(boolean emailNotification) { this.emailNotification = emailNotification; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
