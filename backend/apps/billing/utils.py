import uuid
from billing.models import Bill
def generate_bill_number(self):
        """Generate a unique bill number"""
        import uuid
        from datetime import datetime
        
        # Try to make a unique number with date + random
        date_part = datetime.now().strftime("%y%m%d")
        random_part = uuid.uuid4().hex[:4].upper()
        bill_number = f"INV-{date_part}{random_part}"
        
        # Check if this number already exists, if so generate a new one
        counter = 1
        original_bill_number = bill_number
        while Bill.objects.filter(bill_number=bill_number).exists():
            bill_number = f"{original_bill_number}-{counter}"
            counter += 1
            # Safety break to avoid infinite loop
            if counter > 100:
                bill_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
                break
                
        return bill_number