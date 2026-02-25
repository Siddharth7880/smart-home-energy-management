package com.smarthome.energy.dto;

import java.util.Set;

public class UserRoleUpdateRequest {
    private Set<String> roles;

    public UserRoleUpdateRequest() {
    }

    public UserRoleUpdateRequest(Set<String> roles) {
        this.roles = roles;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}

