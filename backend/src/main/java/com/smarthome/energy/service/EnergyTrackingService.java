package com.smarthome.energy.service;

import com.smarthome.energy.dto.AnalyticsSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * EnergyTrackingService
 *
 * Facade / coordinator for generating standardised AnalyticsSummaryResponse
 * objects
 * for each of the four core reporting periods (daily, weekly, monthly, yearly).
 *
 * Delegates all heavy lifting to {@link AnalyticsService}.
 */
@Service
public class EnergyTrackingService {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Returns today's energy tracking summary (hourly timeline, top devices, peak
     * hour).
     */
    public AnalyticsSummaryResponse getDailyReport() {
        return analyticsService.getSummaryAnalytics("daily");
    }

    /**
     * Returns this week's energy tracking summary (daily timeline, top devices,
     * peak hour).
     */
    public AnalyticsSummaryResponse getWeeklyReport() {
        return analyticsService.getSummaryAnalytics("weekly");
    }

    /**
     * Returns this month's energy tracking summary (daily timeline, top devices,
     * peak hour).
     */
    public AnalyticsSummaryResponse getMonthlyReport() {
        return analyticsService.getSummaryAnalytics("monthly");
    }

    /**
     * Returns this year's energy tracking summary (monthly timeline, top devices,
     * peak hour).
     */
    public AnalyticsSummaryResponse getYearlyReport() {
        return analyticsService.getSummaryAnalytics("yearly");
    }
}
