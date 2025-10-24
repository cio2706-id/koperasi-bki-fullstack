# App Flow Document for Koperasi Pegawai BKI

## Onboarding and Sign-In/Sign-Up

When a new visitor arrives at the Koperasi Pegawai BKI application, they first see the public portal landing page. This page offers links to submit a payment order request or to track an existing request. To access member-only features, the visitor clicks the "Member Portal" link and is taken to a simple email input screen. The user enters their official company email address and clicks "Send Magic Link." Behind the scenes, the system queries the Accurate.id API to verify employment eligibility. If the email is recognized, the app immediately sends an email containing a one-time magic link.

Upon receiving the email, the user clicks the magic link, which brings them back to the app. A secure session is established and they are redirected to the appropriate dashboard based on their role. If the link has expired, the user sees a friendly message explaining that the link is no longer valid and a button to request a new magic link. Signing out is just as easy: clicking the avatar icon in the header reveals a "Sign Out" option that ends the session and returns the user to the public landing page.

## Main Dashboard or Home Page

After logging in, members and admins land on different dashboards. A member sees a clean Member Dashboard. The header greets them by name and displays the current date. Along the left side is a vertical navigation bar with links labeled Dashboard, Apply for Loan, and Settings. The main area shows two prominent widgets: one widget displays the user’s current savings balance fetched live from Accurate.id, and the second widget lists any active loans with their outstanding amounts.

An administrator who logs in sees the Admin Dashboard. The header still shows their name but now also includes their role (for example, Manager or Bendahara). The left navigation bar presents links such as Payment Approvals, Loan Approvals, User Management, and Settings. The default section of the Admin Dashboard loads the approval queue relevant to the user’s role. From both dashboards, clicking a navigation link replaces the main panel content while keeping the header and sidebar in place.

## Detailed Feature Flows and Page Transitions

When a public user selects "Request Payment Order" from the landing page, they land on a multi-field form asking for project details, vendor information, and the requested amount. As the user types, client-side validation ensures that required fields are completed correctly. Submitting the form triggers a server call to create a new payment request record. The user then sees a confirmation page showing a unique reference number and instructions to use the tracking link.

Choosing "Track Payment Order" from the public landing page brings the user to a simple input field for the reference number. Entering the number and clicking "Track" sends a request to the backend. If the reference is found, the user sees a page that displays the current approval status, for example “Pending Manager Approval.” If the number is invalid, a clear error message informs the user that no matching record was found and invites them to try again.

When a member clicks "Apply for Loan" on the Member Dashboard, they begin a three-step loan application process. The first step collects personal and loan details. Proceeding to the second step allows the user to upload supporting documents such as salary slips in a drag-and-drop area. Step three provides a review screen where the user confirms all inputs. Submitting on this final screen sends the completed application to the database and then redirects back to the Member Dashboard, where the new application appears in a "Pending Approval" list.

An administrator in the Admin Portal navigates to their designated approval section. A specific Manager navigates to "Loan Approvals" to see only loan applications in the status "PENDING_MANAGER_APPROVAL." The page component fetches these from the database and passes them to a client table component. Clicking "Approve" on a row calls a secure API endpoint that checks the user’s session and updates the record’s status to the next stage, for instance "PENDING_BENDAHARA_APPROVAL." Once the backend confirms the change, the table automatically refreshes and the approved item disappears from that manager’s view.

A procurement staff member clicks "Payment Approvals" and sees only those orders in status "PENDING_STAFF_APPROVAL." Staff can approve or reject, and each action leads to the next status or to a rejection reason screen. After each action, the staff remains on the same page and the list updates in real time. Similarly, the Bendahara role works from the same sections but sees only the requests that have reached "PENDING_BENDAHARA_APPROVAL." Upon final approval, the request is marked "POSTED_TO_ACCURATE," and the item vanishes from all approval queues.

User Management is available only to top-level administrators. From the Admin Dashboard they click "User Management" in the sidebar. This loads a table of all user profiles, their emails, and assigned roles. Selecting a user brings up a detail view where roles can be added or removed via dropdowns. Saving changes updates the database immediately and the sidebar menu adapts in real time if the current user’s own role is changed.

## Settings and Account Management

Both members and administrators can manage their profile information under Settings. From any dashboard, the user clicks "Settings" in the sidebar, which brings up a form showing their name, email, and contact number. The form also includes toggles for email notifications on approvals and status changes. After updating values, clicking "Save" stores the changes and displays a success banner at the top of the page. A "Back to Dashboard" link returns the user to their home view without reloading the entire app.

Administrators who need to configure system-wide notifications or approval thresholds also find those options under Settings if they hold a special super-admin role. Changes here affect global settings and are versioned behind the scenes. Exiting the Settings area always brings the user back to their own dashboard section.

## Error States and Alternate Paths

If a user enters an unregistered email when requesting a magic link, they immediately see an on-screen error beneath the email field explaining that the address is not recognized. In cases where the Accurate.id API is unreachable during login or dashboard data fetches, the user sees a clear alert at the top of the dashboard explaining there is a temporary connectivity issue and that data may be out of date.

During any form submission, missing or incorrectly formatted inputs trigger inline validation messages next to each problematic field. If the backend rejects a request due to a server error, a full-screen error page appears with a friendly apology and a button that sends the user back to the last valid page or to the homepage.

When attempting to view pages that a user’s role does not permit, the app shows an "Access Denied" message in place of the normal content. This message explains that the action is restricted and provides a link back to the user’s own dashboard.

## Conclusion and Overall App Journey

In a typical journey, a visitor first interacts with the public portal to file or track a payment order without logging in. When they need member-only features like savings overview or loan applications, they enter their email and use a magic link to sign in. Once authenticated, members see a dashboard with key financial widgets and complete multi-step loan applications. Administrators follow parallel login steps but land in a role-aware Admin Dashboard showing the right approval queues and user management options. At any point, profile settings and notifications are just a click away, and comprehensive error messages guide the user back to smooth operation. From public forms to final approvals posted to Accurate.id, every page transition and backend check connects seamlessly to deliver a clear, secure, and fully traceable experience for all user roles.