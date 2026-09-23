package com.findit.service;

import com.findit.dto.admin.AdminDashboardResponse;
import com.findit.dto.admin.AdminUserResponse;
import com.findit.dto.admin.UpdateUserRoleRequest;
import com.findit.entity.ClaimStatus;
import com.findit.entity.ItemStatus;
import com.findit.entity.ItemType;
import com.findit.entity.Role;
import com.findit.entity.User;
import com.findit.exception.BadRequestException;
import com.findit.exception.ResourceNotFoundException;
import com.findit.repository.ClaimRepository;
import com.findit.repository.ItemRepository;
import com.findit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private ClaimService claimService;

    @InjectMocks
    private AdminService adminService;

    private User adminUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("Admin", "admin@findit.edu", "pass", "111", Role.ADMIN);
        adminUser.setId(1L);

        studentUser = new User("Student", "student@findit.edu", "pass", "222", Role.STUDENT);
        studentUser.setId(2L);
    }

    @Test
    @DisplayName("Get dashboard stats returns accurate metrics")
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(10L);
        when(itemRepository.count()).thenReturn(20L);
        when(itemRepository.countByType(ItemType.LOST)).thenReturn(8L);
        when(itemRepository.countByType(ItemType.FOUND)).thenReturn(12L);
        when(itemRepository.countByStatus(ItemStatus.ACTIVE)).thenReturn(14L);
        when(itemRepository.countByStatus(ItemStatus.CLAIMED)).thenReturn(4L);
        when(itemRepository.countByStatus(ItemStatus.RETURNED)).thenReturn(2L);
        when(claimRepository.countByStatus(ClaimStatus.PENDING)).thenReturn(5L);

        AdminDashboardResponse stats = adminService.getDashboardStats();

        assertEquals(10L, stats.getTotalUsers());
        assertEquals(20L, stats.getTotalItems());
        assertEquals(8L, stats.getLostItems());
        assertEquals(12L, stats.getFoundItems());
        assertEquals(14L, stats.getActiveItems());
        assertEquals(4L, stats.getClaimedItems());
        assertEquals(2L, stats.getReturnedItems());
        assertEquals(5L, stats.getPendingClaims());
    }

    @Test
    @DisplayName("Get users without search returns all users")
    void testGetUsers_NoSearch() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, studentUser));

        List<AdminUserResponse> users = adminService.getUsers(null);

        assertEquals(2, users.size());
        assertEquals("Admin", users.get(0).getName());
        assertEquals(Role.ADMIN, users.get(0).getRole());
        assertEquals("Student", users.get(1).getName());
        assertEquals(Role.STUDENT, users.get(1).getRole());
    }

    @Test
    @DisplayName("Get users with search term queries repository")
    void testGetUsers_WithSearch() {
        when(userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase("ansh", "ansh"))
                .thenReturn(List.of(studentUser));

        List<AdminUserResponse> users = adminService.getUsers("ansh");

        assertEquals(1, users.size());
        assertEquals("Student", users.get(0).getName());
        verify(userRepository, times(1)).findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase("ansh", "ansh");
    }

    @Test
    @DisplayName("Update user role successfully from STUDENT to ADMIN")
    void testUpdateUserRole_PromoteStudent() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        AdminUserResponse response = adminService.updateUserRole(2L, new UpdateUserRoleRequest(Role.ADMIN));

        assertEquals(Role.ADMIN, response.getRole());
        assertEquals(Role.ADMIN, studentUser.getRole());
    }

    @Test
    @DisplayName("Demoting the only admin is blocked by last-admin safeguard")
    void testUpdateUserRole_DemoteLastAdmin_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                adminService.updateUserRole(1L, new UpdateUserRoleRequest(Role.STUDENT))
        );

        assertTrue(ex.getMessage().contains("Cannot demote the last administrator account"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Demoting an admin when multiple admins exist succeeds")
    void testUpdateUserRole_DemoteAdminWithMultipleAdmins_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(3L);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        AdminUserResponse response = adminService.updateUserRole(1L, new UpdateUserRoleRequest(Role.STUDENT));

        assertEquals(Role.STUDENT, response.getRole());
        assertEquals(Role.STUDENT, adminUser.getRole());
        verify(userRepository, times(1)).save(adminUser);
    }

    @Test
    @DisplayName("Update user role throws ResourceNotFoundException for invalid ID")
    void testUpdateUserRole_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                adminService.updateUserRole(999L, new UpdateUserRoleRequest(Role.ADMIN))
        );
    }
}
