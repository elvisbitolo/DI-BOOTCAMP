
family = {"rick": 43, 'beth': 13, 'morty': 5, 'summer': 8}

# ticket prices based on age
total_cost = 0

print("Ticket Prices:")
print("-" * 30)

for name, age in family.items():
    if age < 3:
        ticket_price = 0
    elif age <= 12:
        ticket_price = 10
    else:
        ticket_price = 15
    
    total_cost += ticket_price
    print(f"{name.capitalize()}: {age} years old - ${ticket_price}")

print("-" * 30)
print(f"Total Cost: ${total_cost}")
