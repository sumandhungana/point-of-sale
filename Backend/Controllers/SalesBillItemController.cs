using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesBillItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SalesBillItemController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/SalesBillItem
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesBillItem>>> GetSalesBillItems()
    {
        return await _context.SalesBillItems
            .Include(s => s.Product)
            .Include(s => s.SalesBill)
            .ToListAsync();
    }

    // GET: api/SalesBillItem/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesBillItem>> GetSalesBillItem(int id)
    {
        var salesBillItem = await _context.SalesBillItems
            .Include(s => s.Product)
            .Include(s => s.SalesBill)
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
            .Include(s => s.Product)
            .Include(s => s.SalesBill)
            .Where(s => s.SalesBillId == billId)
            .ToListAsync();
    }

    // POST: api/SalesBillItem
    [HttpPost]
    public async Task<ActionResult<SalesBillItem>> CreateSalesBillItem(SalesBillItem salesBillItem)
    {
        // Calculate prices
        salesBillItem.TotalPrice = salesBillItem.Quantity * salesBillItem.UnitPrice;
        salesBillItem.FinalPrice = salesBillItem.TotalPrice;

        if (salesBillItem.Discount.HasValue)
        {
            salesBillItem.FinalPrice -= salesBillItem.Discount.Value;
        }

        if (salesBillItem.Tax.HasValue)
        {
            salesBillItem.FinalPrice += salesBillItem.Tax.Value;
        }

        _context.SalesBillItems.Add(salesBillItem);
        await _context.SaveChangesAsync();

        // Update bill totals
        await UpdateBillTotals(salesBillItem.SalesBillId);

        return CreatedAtAction(nameof(GetSalesBillItem), new { id = salesBillItem.Id }, salesBillItem);
    }

    // PUT: api/SalesBillItem/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSalesBillItem(int id, SalesBillItem salesBillItem)
    {
        if (id != salesBillItem.Id)
        {
            return BadRequest();
        }

        // Calculate prices
        salesBillItem.TotalPrice = salesBillItem.Quantity * salesBillItem.UnitPrice;
        salesBillItem.FinalPrice = salesBillItem.TotalPrice;

        if (salesBillItem.Discount.HasValue)
        {
            salesBillItem.FinalPrice -= salesBillItem.Discount.Value;
        }

        if (salesBillItem.Tax.HasValue)
        {
            salesBillItem.FinalPrice += salesBillItem.Tax.Value;
        }

        _context.Entry(salesBillItem).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
            
            // Update bill totals
            await UpdateBillTotals(salesBillItem.SalesBillId);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SalesBillItemExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
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

        var billId = salesBillItem.SalesBillId;
        _context.SalesBillItems.Remove(salesBillItem);
        await _context.SaveChangesAsync();

        // Update bill totals
        await UpdateBillTotals(billId);

        return NoContent();
    }

    private async Task UpdateBillTotals(int billId)
    {
        var bill = await _context.SalesBills
            .Include(b => b.SalesBillItems)
            .FirstOrDefaultAsync(b => b.Id == billId);

        if (bill != null)
        {
            bill.TotalAmount = bill.SalesBillItems.Sum(i => i.TotalPrice);
            bill.GrandTotal = bill.SalesBillItems.Sum(i => i.FinalPrice);
            await _context.SaveChangesAsync();
        }
    }

    private bool SalesBillItemExists(int id)
    {
        return _context.SalesBillItems.Any(e => e.Id == id);
    }
} 