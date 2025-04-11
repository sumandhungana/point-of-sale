using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string Password { get; set; } = string.Empty;
    
    public bool Enable { get; set; } = false;
    
    [StringLength(50)]
    public string? Branch { get; set; }
    
    [StringLength(20)]
    public string Permission { get; set; } = "user";
    
    [StringLength(50)]
    public string? Parent { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? Company { get; set; }
    
    [StringLength(100)]
    [EmailAddress]
    public string? Email { get; set; }
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(20)]
    public string? Pan { get; set; }
    
    public string? Remarks { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 