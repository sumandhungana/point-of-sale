using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;



public enum SubscriptionType
{
    None = 0,
    Trial = 1,
    Monthly = 2,
    Yearly = 3
}

public enum SubscriptionStatus
{
    None = 0,
    Active = 1,
    Expired = 2,
    Cancelled = 3,
    Trial = 4
}


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

    public string? ImagePath { get; set; }
    
    public string PasswordHash { get; set; } = string.Empty;
    
    public string PasswordSalt { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

   
    // SUBSCRIPTION FIELDS
  

    public SubscriptionType SubscriptionType { get; set; } = SubscriptionType.None;

    public DateTime? SubscriptionStartDate { get; set; }

    public DateTime? SubscriptionEndDate { get; set; }

    public bool IsSubscriptionActive { get; set; } = false;

    public bool HasUsedTrial { get; set; } = false;

    public DateTime? TrialStartDate { get; set; }

    public DateTime? TrialEndDate { get; set; }

    public SubscriptionStatus SubscriptionStatus { get; set; } = SubscriptionStatus.None;
}