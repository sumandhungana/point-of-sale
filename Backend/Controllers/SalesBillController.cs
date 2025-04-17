using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesBillController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SalesBillController> _logger;

    public SalesBillController(ApplicationDbContext context, ILogger<SalesBillController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/SalesBill
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesBill>>> GetSalesBills()
    {
        return await _context.SalesBills
            .Include(s => s.Customer)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/SalesBill/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesBill>> GetSalesBill(int id)
    {
        var salesBill = await _context.SalesBills
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (salesBill == null)
        {
            return NotFound();
        }

        return salesBill;
    }

    // POST: api/SalesBill
    [HttpPost]
    public async Task<ActionResult<SalesBill>> CreateSalesBill([FromBody] SalesBillRequest request)
    {
        try
        {
            var salesBill = new SalesBill
            {
                BillNumber = request.BillNumber,
                BillDate = request.BillDate.ToUniversalTime(),
                CustomerId = request.CustomerId,
                PaymentMode = request.PaymentMode,
                Amount = request.NetAmount,
                Remarks = $"Total: {request.TotalAmount}, Discount: {request.DiscountAmount}, Tax: {request.TaxAmount}, Status: {request.PaymentStatus}",
                PhotoPath = request.PhotoPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SalesBills.Add(salesBill);
            await _context.SaveChangesAsync();

            // Include customer details in the response
            var response = await _context.SalesBills
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Id == salesBill.Id);

            return CreatedAtAction(nameof(GetSalesBill), new { id = salesBill.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sales bill");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/SalesBill/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSalesBill(int id, [FromForm] SalesBillUpdateDto salesBillDto)
    {
        try
        {
            var salesBill = await _context.SalesBills.FindAsync(id);
            if (salesBill == null)
            {
                return NotFound();
            }

            salesBill.BillNumber = salesBillDto.BillNumber;
            salesBill.BillDate = salesBillDto.BillDate.ToUniversalTime();
            salesBill.CustomerId = salesBillDto.CustomerId;
            salesBill.PaymentMode = salesBillDto.PaymentMode;
            salesBill.Amount = salesBillDto.Amount;
            salesBill.Remarks = salesBillDto.Remarks;
            salesBill.UpdatedAt = DateTime.UtcNow;

            if (salesBillDto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(salesBill.PhotoPath))
                {
                    FileUploadHelper.DeleteFile(salesBill.PhotoPath);
                }
                // Upload new photo
                salesBill.PhotoPath = await FileUploadHelper.UploadFileAsync(salesBillDto.Photo, _logger);
            }

            _context.Entry(salesBill).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sales bill");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/SalesBill/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalesBill(int id)
    {
        var salesBill = await _context.SalesBills.FindAsync(id);
        if (salesBill == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(salesBill.PhotoPath))
        {
            FileUploadHelper.DeleteFile(salesBill.PhotoPath);
        }

        _context.SalesBills.Remove(salesBill);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SalesBillExists(int id)
    {
        return _context.SalesBills.Any(e => e.Id == id);
    }
}

public class SalesBillRequest
{
    [Required]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    public int CustomerId { get; set; }
    public DateTime BillDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string PaymentStatus { get; set; } = null!;
    public string? PhotoPath { get; set; }
    
}


public class SalesBillUpdateDto
{
    [Required]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    public DateTime BillDate { get; set; }
    
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public IFormFile? Photo { get; set; }
} 