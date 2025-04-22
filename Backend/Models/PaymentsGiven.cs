using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class PaymentsGiven
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PartyId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        public string Remarks { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string BillPath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("PartyId")]
        public virtual Customer? Party { get; set; }
    }
} 