using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class KhataBook
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Personal Info
        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [StringLength(20)]
        public string Number { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        // Business Info
        [StringLength(255)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(20)]
        public string CompanyNumber { get; set; } = string.Empty;

        public string CompanyAddress { get; set; } = string.Empty;

        [StringLength(255)]
        public string CompanyEmail { get; set; } = string.Empty;

        public BusinessCategory BusinessCategory { get; set; }

        public BusinessType BusinessType { get; set; }

        // Financial Info
        public bool TaxVat { get; set; }

        public bool BookAccount { get; set; }

        [Column("Kyc")]
        public bool KYC { get; set; }

        public string? ImagePath { get; set; }

        // Usage Status
        public bool IsUsed { get; set; } = false;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum BusinessCategory
    {
        Retail,
        Wholesale,
        Manufacturing,
        Service
    }

    public enum BusinessType
    {
        Sole,
        Partnership,
        Corporation,
        Llc
    }
} 