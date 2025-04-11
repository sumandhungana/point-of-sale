using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class RolePermission
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int RoleId { get; set; }
    
    [Required]
    public int PermissionId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("RoleId")]
    public Role Role { get; set; } = null!;
    
    [ForeignKey("PermissionId")]
    public Permission Permission { get; set; } = null!;
} 