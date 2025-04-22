using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
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

        public PaymentsGivenController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PaymentsGiven
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentsGiven>>> GetPaymentsGiven()
        {
            return await _context.PaymentsGiven
                .Include(p => p.Party)
                .ToListAsync();
        }

        // GET: api/PaymentsGiven/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentsGiven>> GetPaymentsGiven(int id)
        {
            var paymentsGiven = await _context.PaymentsGiven
                .Include(p => p.Party)
                .FirstOrDefaultAsync(p => p.Id == id);

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
            return await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId)
                .ToListAsync();
        }

        // GET: api/PaymentsGiven/history/party/5
        [HttpGet("history/party/{partyId}")]
        public async Task<ActionResult<IEnumerable<PaymentHistory>>> GetPaymentHistoryByParty(int partyId)
        {
            // Get all payments given and received for the party
            var givenPayments = await _context.PaymentsGiven
                .Include(p => p.Party)
                .Where(p => p.PartyId == partyId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party.Name,
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
                .Where(p => p.PartyId == partyId)
                .Select(p => new PaymentHistory
                {
                    Id = p.Id,
                    PartyId = p.PartyId,
                    PartyName = p.Party.Name,
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

        // POST: api/PaymentsGiven
        [HttpPost]
        public async Task<ActionResult<PaymentsGiven>> PostPaymentsGiven([FromBody] PaymentsGiven paymentsGiven)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the party first
            var party = await _context.Customers.FindAsync(paymentsGiven.PartyId);
            if (party == null)
            {
                return BadRequest("Invalid PartyId");
            }

            // Create a new instance to avoid any navigation property issues
            var newPayment = new PaymentsGiven
            {
                PartyId = paymentsGiven.PartyId,
                Amount = paymentsGiven.Amount,
                Remarks = paymentsGiven.Remarks,
                Date = paymentsGiven.Date,
                BillPath = paymentsGiven.BillPath,
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
        public async Task<IActionResult> PutPaymentsGiven(int id, PaymentsGiven paymentsGiven)
        {
            if (id != paymentsGiven.Id)
            {
                return BadRequest();
            }

            paymentsGiven.UpdatedAt = DateTime.UtcNow;
            _context.Entry(paymentsGiven).State = EntityState.Modified;

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

            return NoContent();
        }

        // DELETE: api/PaymentsGiven/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentsGiven(int id)
        {
            var paymentsGiven = await _context.PaymentsGiven.FindAsync(id);
            if (paymentsGiven == null)
            {
                return NotFound();
            }

            _context.PaymentsGiven.Remove(paymentsGiven);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PaymentsGivenExists(int id)
        {
            return _context.PaymentsGiven.Any(e => e.Id == id);
        }
    }
} 