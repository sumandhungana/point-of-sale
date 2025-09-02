using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsGivenController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IKhataBookContext _khataBookContext;

        public PaymentsGivenController(ApplicationDbContext context, IKhataBookContext khataBookContext)
        {
            _context = context;
            _khataBookContext = khataBookContext;
        }

        // GET: api/PaymentsGiven
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentsGiven>>> GetPaymentsGiven()
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            return await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.KhataBookId == currentKhataBookId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // GET: api/PaymentsGiven/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentsGiven>> GetPaymentsGiven(int id)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var paymentsGiven = await _context.PaymentsGiven
                .Include(p => p.Party)
                .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);

            if (paymentsGiven == null)
            {
                return NotFound();
            }

            return paymentsGiven;
        }

        // GET: api/PaymentsGiven/party/5
        [HttpGet("party/{partyId}")]
        public async Task<ActionResult<IEnumerable<PaymentsGiven>>> GetPaymentsGivenByParty(int partyId)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            return await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId && p.KhataBookId == currentKhataBookId)
                .ToListAsync();
        }

        // GET: api/PaymentsGiven/history/party/5
        [HttpGet("history/party/{partyId}")]
        public async Task<ActionResult<IEnumerable<PaymentHistory>>> GetPaymentHistoryByParty(int partyId)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            // Get all payments given and received for the party
            var givenPayments = await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId && p.KhataBookId == currentKhataBookId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party != null ? p.Party.Name : string.Empty,
                    Amount = p.Amount,
                    Remarks = p.Remarks,
                    Date = p.Date,
                    BillPath = p.BillPath,
                    Type = "Given",
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            var receivedPayments = await _context.PaymentsReceived
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId && p.KhataBookId == currentKhataBookId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party != null ? p.Party.Name : string.Empty,
                    Amount = p.Amount,
                    Remarks = p.Remarks,
                    Date = p.Date,
                    BillPath = p.BillPath,
                    Type = "Received",
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            // Merge and sort by date
            var allPayments = givenPayments.Concat(receivedPayments)
                .OrderBy(p => p.Date)
                .ToList();  

            // Calculate running balance
            decimal currentBalance = 0;
            foreach (var payment in allPayments)
            {
                payment.OldBalance = currentBalance;
                if (payment.Type == "Given")
                {
                    currentBalance -= payment.Amount;
                }
                else
                {
                    currentBalance += payment.Amount;
                }
                payment.NewBalance = currentBalance;
            }

            return allPayments;
        }

        // GET: api/PaymentsGiven/dashboard/totals
        [HttpGet("dashboard/totals")]
        public async Task<ActionResult<object>> GetDashboardPaymentTotals()
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            
            // Get total of all payments given
            var totalGiven = await _context.PaymentsGiven
                .Where(p => p.KhataBookId == currentKhataBookId)
                .SumAsync(p => p.Amount);
            
            // Get total of all payments received
            var totalReceived = await _context.PaymentsReceived
                .Where(p => p.KhataBookId == currentKhataBookId)
                .SumAsync(p => p.Amount);
            
            return Ok(new
            {
                totalGiven = totalGiven,
                totalReceived = totalReceived
            });
        }

        // POST: api/PaymentsGiven
        [HttpPost]
        public async Task<ActionResult<PaymentsGiven>> PostPaymentsGiven([FromBody] CreatePaymentsGivenDto paymentsGivenDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the party first
            var party = await _context.Customers.FindAsync(paymentsGivenDto.PartyId);
            if (party == null)
            {
                return BadRequest("Invalid PartyId");
            }

            // Create a new instance to avoid any navigation property issues
            var newPayment = new PaymentsGiven
            {
                KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
                PartyId = paymentsGivenDto.PartyId,
                Amount = paymentsGivenDto.Amount,
                Remarks = paymentsGivenDto.Remarks,
                Date = paymentsGivenDto.Date,
                BillPath = paymentsGivenDto.BillPath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PaymentsGiven.Add(newPayment);
            await _context.SaveChangesAsync();

            // Load the party for the response
            await _context.Entry(newPayment).Reference(p => p.Party).LoadAsync();

            return CreatedAtAction("GetPaymentsGiven", new { id = newPayment.Id }, newPayment);
        }

        // PUT: api/PaymentsGiven/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaymentsGiven(int id, [FromBody] PaymentsGivenUpdateDto updateDto)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var existingPayment = await _context.PaymentsGiven
                .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
            if (existingPayment == null)
            {
                return NotFound();
            }

            // Update only the specified fields
            existingPayment.Amount = updateDto.Amount;
            existingPayment.Remarks = updateDto.Remarks;
            existingPayment.Date = updateDto.Date;
            existingPayment.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentsGivenExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Payment given updated successfully" });
        }

        // DELETE: api/PaymentsGiven/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentsGiven(int id)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var paymentsGiven = await _context.PaymentsGiven
                .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
            if (paymentsGiven == null)
            {
                return NotFound();
            }

            _context.PaymentsGiven.Remove(paymentsGiven);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Payment given deleted successfully" });
        }

        private bool PaymentsGivenExists(int id)
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            return _context.PaymentsGiven.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
        }

        // DTO for updating payments given
        public class PaymentsGivenUpdateDto
        {
            public int Id { get; set; }
            public decimal Amount { get; set; }
            public string Remarks { get; set; }
            public DateTime Date { get; set; }
        }
    }
} 