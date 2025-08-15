using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PurchaseController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public PurchaseController(ApplicationDbContext context, ILogger<PurchaseController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Purchase
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Purchase>>> GetPurchases()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Purchases
            .Include(p => p.Category)
            .Include(p => p.Item)
            .Where(p => p.KhataBookId == currentKhataBookId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Purchase/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Purchase>> GetPurchase(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var purchase = await _context.Purchases
            .Include(p => p.Category)
            .Include(p => p.Item)
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);

        if (purchase == null)
        {
            return NotFound();
        }

        return purchase;
    }

    // GET: api/Purchase/last
    [HttpGet("last")]
    public async Task<ActionResult<LastPurchaseNoResponse>> GetLastPurchaseNo()
    {
        try
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var lastPurchase = await _context.Purchases
                .Where(p => p.KhataBookId == currentKhataBookId)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            var lastPurchaseNo = lastPurchase?.PurchaseNo ?? "0";
            
            return Ok(new LastPurchaseNoResponse
            {
                lastPurchaseNo = lastPurchaseNo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching last purchase number");
            return BadRequest(ex.Message);
        }
    }

    // POST: api/Purchase
    [HttpPost]
    public async Task<ActionResult<Purchase>> CreatePurchase([FromForm] PurchaseCreateDto purchaseDto)
    {
        try
        {
            // Validate that the Item exists
            var item = await _context.Items.FindAsync(purchaseDto.ItemId);
            if (item == null)
            {
                return BadRequest($"Item with ID {purchaseDto.ItemId} does not exist");
            }

            // Validate that the Category exists
            var category = await _context.Categories.FindAsync(purchaseDto.CategoryId);
            if (category == null)
            {
                return BadRequest($"Category with ID {purchaseDto.CategoryId} does not exist");
            }

            string photoPath = null;
            if (purchaseDto.Photo != null)
            {
                photoPath = await FileUploadHelper.UploadFileAsync(purchaseDto.Photo, _logger);
            }

            var purchase = new Purchase
            {
                KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
                PurchaseNo = purchaseDto.PurchaseNo,
                Date = purchaseDto.Date.ToUniversalTime(),
                CategoryId = purchaseDto.CategoryId,
                ItemId = purchaseDto.ItemId,
                PaymentMode = purchaseDto.PaymentMode,
                Amount = purchaseDto.Amount,
                Remarks = purchaseDto.Remarks,
                PhotoPath = photoPath,
                CreatedAt = DateTime.UtcNow
            };

            _context.Purchases.Add(purchase);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPurchase), new { id = purchase.Id }, purchase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating purchase entry");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Purchase/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchase(int id, [FromForm] PurchaseUpdateDto purchaseDto)
    {
        try
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var purchase = await _context.Purchases
                .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
            if (purchase == null)
            {
                return NotFound();
            }

            purchase.PurchaseNo = purchaseDto.PurchaseNo;
            purchase.Date = purchaseDto.Date.ToUniversalTime();
            purchase.CategoryId = purchaseDto.CategoryId;
            purchase.ItemId = purchaseDto.ItemId;
            purchase.PaymentMode = purchaseDto.PaymentMode;
            purchase.Amount = purchaseDto.Amount;
            purchase.Remarks = purchaseDto.Remarks;

            if (purchaseDto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(purchase.PhotoPath))
                {
                    FileUploadHelper.DeleteFile(purchase.PhotoPath);
                }
                // Upload new photo
                purchase.PhotoPath = await FileUploadHelper.UploadFileAsync(purchaseDto.Photo, _logger);
            }

            _context.Entry(purchase).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(purchase);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating purchase entry");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Purchase/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchase(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var purchase = await _context.Purchases
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
        if (purchase == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(purchase.PhotoPath))
        {
            FileUploadHelper.DeleteFile(purchase.PhotoPath);
        }

        _context.Purchases.Remove(purchase);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PurchaseExists(int id)
    {
        return _context.Purchases.Any(e => e.Id == id);
    }
}

public class PurchaseCreateDto
{
    [Required]
    public string PurchaseNo { get; set; } = null!;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public IFormFile? Photo { get; set; }
}

public class PurchaseUpdateDto
{
    [Required]
    public string PurchaseNo { get; set; } = null!;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public IFormFile? Photo { get; set; }
}

public class LastPurchaseNoResponse
{
    public string lastPurchaseNo { get; set; } = null!;
} 