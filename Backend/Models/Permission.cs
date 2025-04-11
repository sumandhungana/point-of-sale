using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Permission
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Module { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string PermissionName { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property for role permissions
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
} 