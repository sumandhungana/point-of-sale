using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class StaffAttendance
{
    [Key]
    public int Id { get; set; }
    
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