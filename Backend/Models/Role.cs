using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Role
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Required]
    public string Status { get; set; } = null!;

    [Required]
    [StringLength(255)]
    public string Description { get; set; } = null!;


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property for role permissions
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
} 