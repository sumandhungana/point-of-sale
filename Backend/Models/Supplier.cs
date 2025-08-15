using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Supplier
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? Company { get; set; }
    
    [StringLength(20)]
    public string? Pan { get; set; }
    
    [Required]
    [StringLength(100)]
    public string? ContactPerson { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating suppliers - excludes navigation properties
public class CreateSupplierDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    [EmailAddress]
    public string? Email { get; set; }
    
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? Company { get; set; }
    
    [StringLength(20)]
    public string? Pan { get; set; }
    
    [Required]
    [StringLength(100)]
    public string? ContactPerson { get; set; }
} 