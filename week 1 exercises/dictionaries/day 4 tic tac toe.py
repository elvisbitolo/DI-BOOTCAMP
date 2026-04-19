# =========================
# Tic Tac Toe Game
# =========================

# Step 1: Display the Board
def display_board(board):
    print("\n")
    for row in range(3):
        print(" | ".join(board[row]))
        if row < 2:
            print("--+---+--")
    print("\n")

# Step 2: Player Input
def player_input(player, board):
    while True:
        try:
            pos = input(f"Player {player}, enter your move as row,col (1-3 for both): ")
            row, col = map(int, pos.strip().split(","))
            if row < 1 or row > 3 or col < 1 or col > 3:
                print("Invalid input. Row and column must be 1, 2, or 3.")
                continue
            if board[row-1][col-1] != " ":
                print("Cell already taken. Choose another.")
                continue
            return row-1, col-1
        except ValueError:
            print("Invalid input format. Use row,col (e.g., 2,3).")

# Step 3: Check Win
def check_win(board, player):
    # Check rows and columns
    for i in range(3):
        if all(board[i][j] == player for j in range(3)):  # row
            return True
        if all(board[j][i] == player for j in range(3)):  # column
            return True
    # Check diagonals
    if all(board[i][i] == player for i in range(3)):
        return True
    if all(board[i][2-i] == player for i in range(3)):
        return True
    return False

# Step 4: Check Tie
def check_tie(board):
    return all(board[row][col] != " " for row in range(3) for col in range(3))

# Step 5: Switch Player
def switch_player(current):
    return "O" if current == "X" else "X"

# Step 6: Main Game Loop
def play():
    board = [[" " for _ in range(3)] for _ in range(3)]
    current_player = "X"
    winner = None

    print("Welcome to Tic Tac Toe!")
    display_board(board)

    while True:
        row, col = player_input(current_player, board)
        board[row][col] = current_player
        display_board(board)

        if check_win(board, current_player):
            winner = current_player
            print(f"Player {winner} wins! 🎉")
            break

        if check_tie(board):
            print("It's a tie! 🤝")
            break

        current_player = switch_player(current_player)

# Start the game
play()
