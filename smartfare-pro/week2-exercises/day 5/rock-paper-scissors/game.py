import random


class Game:
    def __init__(self):
        self.choices = ["rock", "paper", "scissors"]

    # Step 2
    def get_user_item(self):
        while True:
            user = input("Choose rock, paper, or scissors: ").lower()

            if user in self.choices:
                return user

            print("Invalid choice. Try again.")

    # Step 3
    def get_computer_item(self):
        return random.choice(self.choices)

    # Step 4
    def get_game_result(self, user_item, computer_item):
        if user_item == computer_item:
            return "draw"

        if (
            (user_item == "rock" and computer_item == "scissors") or
            (user_item == "paper" and computer_item == "rock") or
            (user_item == "scissors" and computer_item == "paper")
        ):
            return "win"

        return "loss"

    # Step 5
    def play(self):
        user_item = self.get_user_item()
        computer_item = self.get_computer_item()
        result = self.get_game_result(user_item, computer_item)

        print("\n--- GAME RESULT ---")
        print("You chose:", user_item)
        print("Computer chose:", computer_item)
        print("Result:", result)

        return result