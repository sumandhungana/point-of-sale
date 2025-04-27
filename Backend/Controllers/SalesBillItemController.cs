using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesBillItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SalesBillItemController> _logger;

    public SalesBillItemController(ApplicationDbContext context, ILogger<SalesBillItemController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/SalesBillItem
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesBillItem>>> GetSalesBillItems()
    {
        return await _context.SalesBillItems
            .Include(s => s.SalesBill)
            .Include(s => s.Item)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/SalesBillItem/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesBillItem>> GetSalesBillItem(int id)
    {
        var salesBillItem = await _context.SalesBillItems
            .Include(s => s.SalesBill)
            .Include(s => s.Item)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (salesBillItem == null)
        {
            return NotFound();
        }

        return salesBillItem;
    }

    // GET: api/SalesBillItem/Bill/5
    [HttpGet("Bill/{billId}")]
    public async Task<ActionResult<IEnumerable<SalesBillItem>>> GetSalesBillItemsByBillId(int billId)
    {
        return await _context.SalesBillItems
            .Include(s => s.Item)
            .Include(s => s.SalesBill)
            .Where(s => s.SalesBillId == billId)
            .ToListAsync();
    }

    // POST: api/SalesBillItem
    [HttpPost]
    public async Task<ActionResult<SalesBillItem>> CreateSalesBillItem([FromForm] SalesBillItemCreateDto salesBillItemDto)
    {
        try
        {
            var salesBillItem = new SalesBillItem
            {
                SalesBillId = salesBillItemDto.SalesBillId,
                ItemId = salesBillItemDto.ItemId,
                Quantity = salesBillItemDto.Quantity,
                UnitPrice = salesBillItemDto.UnitPrice,
                TotalPrice = salesBillItemDto.Quantity * salesBillItemDto.UnitPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SalesBillItems.Add(salesBillItem);
            await _context.SaveChangesAsync();

            // Update the SalesBill amount
            var salesBill = await _context.SalesBills.FindAsync(salesBillItemDto.SalesBillId);
            if (salesBill != null)
            {
                salesBill.Amount = await _context.SalesBillItems
                    .Where(s => s.SalesBillId == salesBillItemDto.SalesBillId)
                    .SumAsync(s => s.TotalPrice);
                salesBill.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetSalesBillItem), new { id = salesBillItem.Id }, salesBillItem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sales bill item");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/SalesBillItem/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSalesBillItem(int id, [FromForm] SalesBillItemUpdateDto salesBillItemDto)
    {
        try
        {
            var salesBillItem = await _context.SalesBillItems.FindAsync(id);
            if (salesBillItem == null)
            {
                return NotFound();
            }

            salesBillItem.Quantity = salesBillItemDto.Quantity;
            salesBillItem.UnitPrice = salesBillItemDto.UnitPrice;
            salesBillItem.TotalPrice = salesBillItemDto.Quantity * salesBillItemDto.UnitPrice;
            salesBillItem.UpdatedAt = DateTime.UtcNow;

            _context.Entry(salesBillItem).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Update the SalesBill amount
            var salesBill = await _context.SalesBills.FindAsync(salesBillItem.SalesBillId);
            if (salesBill != null)
            {
                salesBill.Amount = await _context.SalesBillItems
                    .Where(s => s.SalesBillId == salesBillItem.SalesBillId)
                    .SumAsync(s => s.TotalPrice);
                salesBill.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating sales bill item");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/SalesBillItem/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalesBillItem(int id)
    {
        var salesBillItem = await _context.SalesBillItems.FindAsync(id);
        if (salesBillItem == null)
        {
            return NotFound();
        }

        var salesBillId = salesBillItem.SalesBillId;
        _context.SalesBillItems.Remove(salesBillItem);
        await _context.SaveChangesAsync();

        // Update the SalesBill amount
        var salesBill = await _context.SalesBills.FindAsync(salesBillId);
        if (salesBill != null)
        {
            salesBill.Amount = await _context.SalesBillItems
                .Where(s => s.SalesBillId == salesBillId)
                .SumAsync(s => s.TotalPrice);
            salesBill.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    private bool SalesBillItemExists(int id)
    {
        return _context.SalesBillItems.Any(e => e.Id == id);
    }
}

public class SalesBillItemCreateDto
{
    public int SalesBillId { get; set; }
    public int ItemId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class SalesBillItemUpdateDto
{
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
} 