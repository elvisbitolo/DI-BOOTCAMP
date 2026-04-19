from anagram_checker import AnagramChecker


def display_menu():
    print("\n=== ANAGRAM CHECKER ===")
    print("1. Enter a word")
    print("2. Exit")


def is_input_valid(user_input):
    user_input = user_input.strip()

    # must be one word
    if len(user_input.split()) != 1:
        print("❌ Error: Only a single word allowed.")
        return False

    # must be alphabetic
    if not user_input.isalpha():
        print("❌ Error: Only letters are allowed.")
        return False

    return True


def main():
    checker = AnagramChecker("words.txt")

    while True:
        display_menu()
        choice = input("Choose option: ").strip()

        if choice == "2":
            print("Goodbye 👋")
            break

        elif choice == "1":
            word = input("Enter a word: ").strip()

            if not is_input_valid(word):
                continue

            print("\n🔎 ANALYSIS")
            print(f"YOUR WORD: {word.upper()}")

            if checker.is_valid_word(word):
                print("✔ This is a valid English word.")
            else:
                print("❌ Not found in dictionary (still checking anagrams).")

            anagrams = checker.get_anagrams(word)

            if anagrams:
                print("Anagrams:", ", ".join(anagrams))
            else:
                print("No anagrams found.")

        else:
            print("❌ Invalid choice. Try again.")


if __name__ == "__main__":
    main()