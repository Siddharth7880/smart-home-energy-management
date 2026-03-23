package com.smarthome.energy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AutomationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AutomationScheduler.class);

    @Autowired
    private DeviceScheduleService deviceScheduleService;

    @Autowired
    private AlertService alertService;

    /**
     * Runs every minute to execute any pending device schedules whose time has arrived.
     */
    @Scheduled(cron = "0 * * * * *")
    public void executeScheduledDeviceCommands() {
        logger.debug("⏰ Automation scheduler: checking for due device schedules...");
        try {
            deviceScheduleService.executeDueSchedules();
        } catch (Exception e) {
            logger.error("Error executing scheduled device commands: {}", e.getMessage(), e);
        }
    }

    /**
     * Runs every 5 minutes to check all users' energy consumption against thresholds.
     */
    @Scheduled(fixedRate = 300_000)
    public void checkEnergyOverloads() {
        logger.debug("🔍 Overload monitor: checking all users' energy consumption...");
        try {
            alertService.checkAllUsersForOverload();
        } catch (Exception e) {
            logger.error("Error during energy overload check: {}", e.getMessage(), e);
        }
    }
}
