using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupplierController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SupplierController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public SupplierController(ApplicationDbContext context, ILogger<SupplierController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Supplier
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Suppliers
            .Where(s => s.KhataBookId == currentKhataBookId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Supplier/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Supplier>> GetSupplier(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);

        if (supplier == null)
        {
            return NotFound();
        }

        return supplier;
    }

    // POST: api/Supplier
    [HttpPost]
    public async Task<ActionResult<Supplier>> CreateSupplier(CreateSupplierDto supplierDto)
    {
        var supplier = new Supplier
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Name = supplierDto.Name,
            Phone = supplierDto.Phone,
            Email = supplierDto.Email,
            Address = supplierDto.Address,
            Company = supplierDto.Company,
            Pan = supplierDto.Pan,
            ContactPerson = supplierDto.ContactPerson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Suppliers.Add(supplier);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating supplier");
            throw;
        }

        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
    }

    // PUT: api/Supplier/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, Supplier supplier)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingSupplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        
        if (existingSupplier == null)
        {
            return NotFound();
        }

        existingSupplier.Name = supplier.Name;
        existingSupplier.Phone = supplier.Phone;
        existingSupplier.Email = supplier.Email;
        existingSupplier.Address = supplier.Address;
        existingSupplier.Company = supplier.Company;
        existingSupplier.ContactPerson = supplier.ContactPerson;
        existingSupplier.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SupplierExists(id))
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

    // DELETE: api/Supplier/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        if (supplier == null)
        {
            return NotFound();
        }

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SupplierExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Suppliers.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 