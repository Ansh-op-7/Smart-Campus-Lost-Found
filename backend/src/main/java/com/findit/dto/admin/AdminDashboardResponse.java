package com.findit.dto.admin;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalItems;
    private long lostItems;
    private long foundItems;
    private long activeItems;
    private long claimedItems;
    private long returnedItems;
    private long pendingClaims;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalUsers, long totalItems, long lostItems, long foundItems,
                                  long activeItems, long claimedItems, long returnedItems, long pendingClaims) {
        this.totalUsers = totalUsers;
        this.totalItems = totalItems;
        this.lostItems = lostItems;
        this.foundItems = foundItems;
        this.activeItems = activeItems;
        this.claimedItems = claimedItems;
        this.returnedItems = returnedItems;
        this.pendingClaims = pendingClaims;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getLostItems() {
        return lostItems;
    }

    public void setLostItems(long lostItems) {
        this.lostItems = lostItems;
    }

    public long getFoundItems() {
        return foundItems;
    }

    public void setFoundItems(long foundItems) {
        this.foundItems = foundItems;
    }

    public long getActiveItems() {
        return activeItems;
    }

    public void setActiveItems(long activeItems) {
        this.activeItems = activeItems;
    }

    public long getClaimedItems() {
        return claimedItems;
    }

    public void setClaimedItems(long claimedItems) {
        this.claimedItems = claimedItems;
    }

    public long getReturnedItems() {
        return returnedItems;
    }

    public void setReturnedItems(long returnedItems) {
        this.returnedItems = returnedItems;
    }

    public long getPendingClaims() {
        return pendingClaims;
    }

    public void setPendingClaims(long pendingClaims) {
        this.pendingClaims = pendingClaims;
    }
}
