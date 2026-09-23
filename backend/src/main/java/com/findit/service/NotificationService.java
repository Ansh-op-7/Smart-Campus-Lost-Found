package com.findit.service;

import com.findit.dto.notification.NotificationResponse;
import com.findit.dto.notification.UnreadCountResponse;
import com.findit.entity.Notification;
import com.findit.entity.NotificationType;
import com.findit.entity.User;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedOperationException;
import com.findit.repository.NotificationRepository;
import com.findit.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type) {
        Notification notification = new Notification(title, message, type, user);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(CustomUserDetails userDetails) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(CustomUserDetails userDetails) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userDetails.getId());
        return new UnreadCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, CustomUserDetails userDetails) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userDetails.getId())) {
            throw new UnauthorizedOperationException("You can only modify your own notifications");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(updated);
    }

    @Transactional
    public void markAllAsRead(CustomUserDetails userDetails) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userDetails.getId());
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}
