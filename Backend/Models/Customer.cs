using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Customer
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? Phone { get; set; }
    
    public string? Email { get; set; }
    
    public string? Address { get; set; }
    
    public string? Company { get; set; }
    
    public string? Pan { get; set; }

    public string? ContactPerson { get; set; }

    public bool isSupplier { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // New fields from CustomerProfile form
    public string? BankAccount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CashBalance { get; set; }

    public string? ProfileImage { get; set; }

    public bool CustomerSmsSetting { get; set; } = false;

    public bool SmsLanguage { get; set; } = false;

    public bool TransactionHistoryCheck { get; set; } = false;
} 