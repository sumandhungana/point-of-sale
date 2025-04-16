using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Permission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Module { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string PermissionName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property for role permissions
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
} 