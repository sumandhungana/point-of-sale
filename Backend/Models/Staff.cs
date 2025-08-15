using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Staff
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    [StringLength(255)]
    public string Name { get; set; } = null!;
    
    [StringLength(255)]
    public string? Address { get; set; }
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    public string? Email { get; set; }
    
    public string? Remarks { get; set; }
    
    [StringLength(255)]
    public string? ProfileImageUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<StaffSalary> StaffSalaries { get; set; } = new List<StaffSalary>();
    
    public ICollection<StaffAttendance> StaffAttendances { get; set; } = new List<StaffAttendance>();
}

// DTO for creating staff - excludes navigation properties
public class CreateStaffDto
{
    [Required]
    [StringLength(255)]
    public string Name { get; set; } = null!;
    
    [StringLength(255)]
    public string? Address { get; set; }
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(100)]
    public string? Email { get; set; }
    
    public string? Remarks { get; set; }
    
    [StringLength(255)]
    public string? ProfileImageUrl { get; set; }
} 