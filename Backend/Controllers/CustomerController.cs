using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Linq;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(ApplicationDbContext context, ILogger<CustomerController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Customer
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
    {
        return await _context.Customers
            .Where(c => !c.isSupplier)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Customer/suppliers
    [HttpGet("suppliers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetSuppliers()
    {
        return await _context.Customers
            .Where(c => c.isSupplier)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Customer/customers
    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<Customer>>> GetOnlyCustomers()
    {
        return await _context.Customers
            .Where(c => !c.isSupplier)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Customer/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            return NotFound();
        }

        return customer;
    }

    // POST: api/Customer
    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;
        
        _context.Customers.Add(customer);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating customer");
            throw;
        }

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    // PUT: api/Customer/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCustomer(int id, Customer updatedCustomer)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound();
        }

        // Update only the non-null properties
        if (!string.IsNullOrEmpty(updatedCustomer.Name))
            customer.Name = updatedCustomer.Name;
        if (updatedCustomer.Phone != null)
            customer.Phone = updatedCustomer.Phone;
        if (updatedCustomer.Email != null)
            customer.Email = updatedCustomer.Email;
        if (updatedCustomer.Address != null)
            customer.Address = updatedCustomer.Address;
        if (updatedCustomer.Company != null)
            customer.Company = updatedCustomer.Company;
        if (updatedCustomer.Pan != null)
            customer.Pan = updatedCustomer.Pan;
        if (updatedCustomer.ContactPerson != null)
            customer.ContactPerson = updatedCustomer.ContactPerson;
        if (updatedCustomer.BankAccount != null)
            customer.BankAccount = updatedCustomer.BankAccount;
        if (updatedCustomer.ProfileImage != null)
            customer.ProfileImage = updatedCustomer.ProfileImage;
        
        // Update boolean and decimal fields only if they have non-default values
        if (updatedCustomer.isSupplier != customer.isSupplier)
            customer.isSupplier = updatedCustomer.isSupplier;
        if (updatedCustomer.CashBalance != 0)
            customer.CashBalance = updatedCustomer.CashBalance;
        if (updatedCustomer.CustomerSmsSetting != customer.CustomerSmsSetting)
            customer.CustomerSmsSetting = updatedCustomer.CustomerSmsSetting;
        if (updatedCustomer.SmsLanguage != customer.SmsLanguage)
            customer.SmsLanguage = updatedCustomer.SmsLanguage;
        if (updatedCustomer.TransactionHistoryCheck != customer.TransactionHistoryCheck)
            customer.TransactionHistoryCheck = updatedCustomer.TransactionHistoryCheck;

        customer.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CustomerExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return Ok(customer);
    }

    // DELETE: api/Customer/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound();
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CustomerExists(int id)
    {
        return _context.Customers.Any(e => e.Id == id);
    }
} 