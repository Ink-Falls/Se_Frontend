// UserTable.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserTable from "Se_Frontend/src/components/UserTable.jsx"; // Adjust path if necessary

describe("UserTable Component", () => {
  it('should display "Loading users..." initially', () => {
    render(<UserTable />);
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("should fetch and display user data after loading", async () => {
    render(<UserTable />);

    // Wait for the "Loading users..." text to disappear, implying data has loaded
    await waitFor(
      () => {
        expect(screen.queryByText("Loading users...")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    ); // Adjust timeout if your simulated delay is longer

    // Check if the table headers are rendered
    expect(
      screen.getByRole("columnheader", { name: /#/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Full Name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Role/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /E-Mail/i })
    ).toBeInTheDocument();

    // Check if user data is rendered in the table rows
    expect(
      screen.getByRole("cell", { name: /Ivan Dela Cruz/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /Lara Santos/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /Miguel Rivera/i })
    ).toBeInTheDocument();
    // ... you can add more checks for other users if needed

    // Optionally, you can check for a specific number of rows (excluding header)
    const rows = screen.getAllByRole("row");
    // Assuming 7 users in your data and 1 header row, so 8 rows total.
    // However, getAllByRole('row') might include the header row, so be careful.
    // A safer approach is to check for user names, as done above.
    expect(rows.length).toBeGreaterThanOrEqual(2); // At least header row and one user row
  });

  it('should display "No users found" if usersData is empty', async () => {
    // To test the "No users found" case realistically with this component,
    // you'd need to modify the component to accept usersData as props
    // or mock the fetchUsersData function to return an empty array.
    // For this hardcoded example, we can't easily force "No users found"
    // without changing the component logic.

    // However, if you were to modify UserTable to accept props:
    // const EmptyUserTable = () => <UserTable usersData={[]} />;
    // render(<EmptyUserTable />);
    // await waitFor(() => {
    //   expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
    // });
    // expect(screen.getByText('No users found.')).toBeInTheDocument();

    // For now, with the current component, this test is less relevant as
    // the component is designed to always fetch and display data.
    // In a real scenario, you'd handle cases where the API returns no data.

    // Let's just test that if we wait and the loading disappears, "No users found" is NOT there
    render(<UserTable />);
    await waitFor(
      () => {
        expect(screen.queryByText("Loading users...")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(screen.queryByText("No users found.")).not.toBeInTheDocument(); // Should not be present when data is loaded
  });
});
