package com.smarthome.energy.security;

import com.smarthome.energy.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Lazy
    @Autowired
    private AuthService authService;

    @Value("${smarthome.app.frontendBaseUrl:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        // Determine the provider (google, facebook, etc.)
        String provider = extractProvider(request);

        String targetUrl;
        try {
            // Process OAuth login and validate email existence
            String result = authService.processOAuthPostLogin(oauth2User, provider);

            // Check if OTP verification is required
            if (result.startsWith("OTP_REQUIRED:")) {
                String email = result.substring("OTP_REQUIRED:".length());
                // Redirect to OTP verification page
                targetUrl = frontendBaseUrl + "/verify-otp?email=" + email + "&from=oauth";
            } else {
                // JWT token returned, redirect to callback with token
                targetUrl = frontendBaseUrl + "/oauth/callback?token=" + result;
            }
        } catch (RuntimeException e) {
            // Handle OAuth errors - email not found or validation failed
            String errorMessage = e.getMessage();
            
            // URL encode the error message for safe transmission
            String encodedError = java.net.URLEncoder.encode(errorMessage, "UTF-8");
            
            org.slf4j.LoggerFactory.getLogger(this.getClass())
                    .warn("OAuth login failed: {}", errorMessage);
            
            // Redirect to login page with error message
            // Frontend will parse the error parameter and show appropriate popup
            targetUrl = frontendBaseUrl + "/login?error=" + encodedError + "&type=oauth_error";
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractProvider(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("/oauth2/code/google")) {
            return "google";
        }
        // Add more providers here as needed
        return "unknown";
    }
}
