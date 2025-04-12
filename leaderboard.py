from leaderboardClasses import Leaderboard

def main():
    lb = Leaderboard()
    filename = "usernames.txt"
    lb.load(filename)

    while True:
        print("\n--- Menu ---")
        print("1. Add Player")
        print("2. Record Win")
        print("3. Record Loss")
        print("4. Show Leaderboard")
        print("5. Save & Exit")

        choice = input("Choose (1-5): ").strip()

        if choice == "1":
            lb.add_player(input("Players name: ").strip())

        elif choice == "2":
            lb.record_win(input("Winners name: ").strip())

        elif choice == "3":
            lb.record_loss(input("Loser name: ").strip())

        elif choice == "4":
            lb.show()

        elif choice == "5":
            lb.save(filename)
            print("Saved leaderboard data.")
            break

        else:
            print("Please enter a valid choice.")

if __name__ == "__main__":
    main()
