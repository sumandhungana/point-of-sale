using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class StaffAttendance
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    public int StaffId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public string Status { get; set; } = "absent"; // present, absent, leave
    
    public string? Note { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    [ForeignKey("StaffId")]
    public Staff Staff { get; set; } = null!;
}

// DTO for creating staff attendance - excludes navigation properties
public class CreateStaffAttendanceDto
{
    [Required]
    public int StaffId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public string Status { get; set; } = "absent"; // present, absent, leave
    
    public string? Note { get; set; }
}

// DTO for updating staff attendance - excludes navigation properties and system fields
public class UpdateStaffAttendanceDto
{
    public int? StaffId { get; set; }
    public DateTime? Date { get; set; }
    public string? Status { get; set; }
    public string? Note { get; set; }
} 