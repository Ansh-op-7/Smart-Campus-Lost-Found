package com.findit.service;

import com.findit.dto.notification.NotificationResponse;
import com.findit.dto.notification.UnreadCountResponse;
import com.findit.entity.Notification;
import com.findit.entity.NotificationType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.ResourceNotFoundException;
import com.findit.exception.UnauthorizedOperationException;
import com.findit.repository.NotificationRepository;
import com.findit.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTests {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user1;
    private User user2;
    private CustomUserDetails user1Details;
    private CustomUserDetails user2Details;

    @BeforeEach
    void setUp() {
        user1 = new User("User One", "user1@test.edu", "pass", "111", Role.STUDENT);
        user1.setId(1L);

        user2 = new User("User Two", "user2@test.edu", "pass", "222", Role.STUDENT);
        user2.setId(2L);

        user1Details = new CustomUserDetails(user1);
        user2Details = new CustomUserDetails(user2);
    }

    @Test
    @DisplayName("Create notification successfully")
    void testCreateNotification() {
        Notification notification = new Notification("Test Title", "Test Message", NotificationType.NEW_CLAIM, user1);
        notification.setId(10L);

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(user1, "Test Title", "Test Message", NotificationType.NEW_CLAIM);

        assertNotNull(result);
        assertEquals("Test Title", result.getTitle());
        assertEquals("Test Message", result.getMessage());
        assertEquals(NotificationType.NEW_CLAIM, result.getType());
        assertEquals(user1, result.getUser());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Get my notifications returns list of user notifications")
    void testGetMyNotifications() {
        Notification n1 = new Notification("Title 1", "Msg 1", NotificationType.NEW_CLAIM, user1);
        n1.setId(1L);
        n1.setCreatedAt(LocalDateTime.now());

        Notification n2 = new Notification("Title 2", "Msg 2", NotificationType.CLAIM_APPROVED, user1);
        n2.setId(2L);
        n2.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n1, n2));

        List<NotificationResponse> result = notificationService.getMyNotifications(user1Details);

        assertEquals(2, result.size());
        assertEquals("Title 1", result.get(0).getTitle());
        assertEquals(NotificationType.NEW_CLAIM, result.get(0).getType());
        assertEquals("Title 2", result.get(1).getTitle());
    }

    @Test
    @DisplayName("Get unread count returns correct count")
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        UnreadCountResponse response = notificationService.getUnreadCount(user1Details);

        assertEquals(5L, response.getCount());
        verify(notificationRepository, times(1)).countByUserIdAndIsReadFalse(1L);
    }

    @Test
    @DisplayName("Mark notification as read successfully")
    void testMarkAsRead_Success() {
        Notification n = new Notification("Title", "Msg", NotificationType.NEW_CLAIM, user1);
        n.setId(100L);
        n.setRead(false);

        when(notificationRepository.findById(100L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(100L, user1Details);

        assertTrue(response.isRead());
        verify(notificationRepository, times(1)).save(n);
    }

    @Test
    @DisplayName("Mark notification as read fails if not owner")
    void testMarkAsRead_Unauthorized() {
        Notification n = new Notification("Title", "Msg", NotificationType.NEW_CLAIM, user1);
        n.setId(100L);

        when(notificationRepository.findById(100L)).thenReturn(Optional.of(n));

        assertThrows(UnauthorizedOperationException.class, () ->
                notificationService.markAsRead(100L, user2Details)
        );

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Mark notification as read throws when notification not found")
    void testMarkAsRead_NotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.markAsRead(999L, user1Details)
        );
    }

    @Test
    @DisplayName("Mark all as read updates all unread notifications")
    void testMarkAllAsRead() {
        Notification n1 = new Notification("Title 1", "Msg 1", NotificationType.NEW_CLAIM, user1);
        n1.setId(1L);
        n1.setRead(false);

        Notification n2 = new Notification("Title 2", "Msg 2", NotificationType.CLAIM_APPROVED, user1);
        n2.setId(2L);
        n2.setRead(false);

        when(notificationRepository.findByUserIdAndIsReadFalse(1L)).thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead(user1Details);

        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository, times(1)).saveAll(List.of(n1, n2));
    }
}
