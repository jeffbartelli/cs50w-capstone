# Backplanner (An app for tracking backpack & pannier weight)
## cs50w-capstone

## Table of Contents
- [Capstone Requirements](#capstone-requirements)
- [How To Run This Application](#how-to-run-this-application)
- [Backplanner Introduction](#backplanner-introduction)
- [Backplanner Introduction](#backplanner-introduction)
- [Backplanner Development Requirements](#backplanner-development-requirements)
- [Backplanner Development Notes](#backplanner-development-notes)
- [Backplanner Files](#backplanner-files)

## Capstone Requirements
- [x] Must not be similar to previous projects
- [x] Must utilize Django on the back-end
- [x] Must utilize JavaScript on the front-end
- [x] Must be mobile-responsive
- [x] What's contained in each file
- [x] How to run the application
- [x] A requirements.txt file documenting additional Python packages that must be installed to run the application, if any
- [x] Must contain a comprehensive README.md file that describes my project in detail, and specifically:
      - How this project satisfies the complexity requirements above
      - What's contained in each file I've created
      - How to run this application
      - Any other information the staff should know about this project

[Back to Top](#table-of-contents)

## How To Run This Application
1. Copy the repo to your system.
2. Using the command line, navigate to the folder that contains this repo.
3. Verify you have Python and Django installed on your system. If not you will need to load them.
4. Use ```python manage.py runserver``` to open the site.

I have tried several times to host this site on Heroku, but no tutorial or instructions have worked.

[Back to Top](#table-of-contents)

## Backplanner Introduction
Like many of the websites I've built in the past, Backplanner is based on a Google Sheets tool I built to record the weight of each item of camping gear I have, and to allow me to track what items I plan to carry with me on backpacking and bike touring trips. Ultimately the tool helps me to cut weight when necessary and to identify items that aren't worth the trouble to carry. Other people have used copies of that original tool and it was clear that it was a good candidate for my capstone project.

Backplanner has a robust user interface built in HTML, leaning heavily on bootstrap for its formatting and javascript/jquery for its user interface. The Django templates allow for simple generation of content on page load, pulling data from the database through the view functions I wrote. Records are updated by using javascript's fetch() function to send data to Django for parsing and insertion into the database. *This use of Django on the back-end and javascript on the front-end meets the CS50w requirement*. While I have built on the lessons I learned in CS50w to complete this capstone project, *this website was built from the ground up and has little in common with any CS50w projects*.

To the best of my knowledge I have not included any Python libraries or packages outside of the standard Python library. Therefore, *no requirements.txt file is required for this project*.

[Back to Top](#table-of-contents)

## Backplanner Development Requirements
- [x] Splash page
- [x] Navbar with brand and login/register options
- [x] Login and Register functionality (borrowed from other CS50 projects)
- [x] Collapsible **"How It Works"** section, that informs agents on how to use the site
- [x] **"How it Works"** section has a checkbox where users can decide to have the section collapsed on signin. This preference is stored in the User Model in Django.
- [x] **Back Facts dashboard** - A section that includes a table that provides the following features:
  - Target Weight - an input where the agent enters the target weight for the bag, as well as the preferred unit of measurement. Upon update the weight and unit are passed to the User Model in Django. 
  - Total Table - total pack weight in grams or ounces, variance from target weight, and total items count
  - Subtotal Table - a listing of existing categories with their total weights and item counts
- [x] **Categories** are sections that contain all the items entered by the agent within that category. The category can be excluded from subtotal/total consideration by unchecking the checkbox, and it can be deleted by clicking the delete icon located in the category head. Each category is rendered as a bootstrap card.
- [x] **Create New Category** This dialogue is located at the bottom of the site and gives the agent the means to create a new category. Using javascript, duplicate category names are rejected. A new category card is rendered on the screen but is not recorded in the database until an item has been added to the category.
- [x] **Items Table** All items within a category are listed within the table located within a category. This includes the:
  - Include checkbox
  - Item/Description
  - Quantity
  - Grams
  - Ounces
  - Update Button
  - Delete Button
- [x] Item Manage Options - This includes the Update and Delete buttons displayed as a button group. Upon clicking update, the input fields within the item row are enabled, allowing the user to make changes to the fields. The buttons also change, to show "Submit" and "Cancel" options. Upon cancel, the item row inputs are again disabled. Upon Submit, the item row inputs are disabled, the updates are sent to the Django Item Model, and the dashboard tables are updated using the updateDashboard javascript function. When Delete is clicked, an alert window pops up asking for verification before deleting the item.
- [x] **Create New Item** is a section located at the bottom of each category. It allows the agent to enter the necessary details for a new item. Once all fields are populated, the 'Create' button is enabled and the user can submit the new item. This is sent to the Item Model in Django.
- [x] Django Models & Views have been created to handle all database actions triggered by agent interactions with the application. This includes POST and PUT calls and spans the creation of new records, the modification of records, and the deletion of records.

[Back to Top](#table-of-contents)

## Backplanner Development Notes
The content below is a distillation of the notes I kept as I was building this site. This will give a sense of sequence of actions I took to build the page, as well as notes on some of the challenges I faced.

- Set up the new Django project, with minor tweaks and changes to get the project to function on my system
- Borrowed the registration and login content from a previous CS50 assignment
- Creation of Django models for the site. The primary model is called **Item** and contains the details of items created by agents. Additional fields were added to the **User** model to allow for tracking preferences.
- Figured out how to include jQuery functionality within a Django project. Also had to get a better understanding of static files within Django to connect to my .js and .css files.
- Created wireframe drawings of the overall page design, category cards, new item and new category interfaces
- Created the basic navigation and Bootstrap cards that make up the application interface. As I did this I included elements with html/bootstrap and created empty event listeners for those elements within script.js
- Wrote the collapse functionality for the 'How It Works' section, followed by the functionality for the 'Create a New Category' element. This inserts a new category card, as well as attached event listeners to elements within that card.
- Built out the functionality for the 'Create New Item' element within category cards. At this stage I've only created the UI and event listeners. I have drafted JS to create an object that will be sent to Python. Additional JS and Python functionality will come later.
- Encountered a problem with a script that was attaching event listeners to dynamically generated content. Identified the problem as an unnecessary loop and refactored the code.
- Created the first iteration of dashboardUpdate() within script.js for collecting data from the category cards and updating the dashboard tables.
- Improved the 'Create a New Item' UI so that the 'Create' button is disabled until all input fields are populated.
- Generated a superuser login within Django and then inserted dummy data to test whether my code functions correctly. Various little problems cropped up but were easily addressed. A major bug appeared when creating a new category produced an exponentially growing count of cards. This was fixed by changing the way I was checking for specific classes within elements (I used the jquery hasClass() method to fix the error).
- Refactored javascript event listener attachment loops to reduce duplicative code and to attach event listeners to content generated by Python template structures. This required some experimentation with inserting template structures, but wasn't too challenging.
- Redesigned the update item process and UI to improve the look of the interface and facilitate the collection of input values
- Began building fetch() functions for passing data to Python.
- Built Python functions for deleting categories and items. Testing returned good results
- Tested logging in and logging out, found duplicative elements were generated. Refactored javascript to remedy these problems.
- Indulged in some gold plating and created a function to set all new item unit radio selectors to match the selected unit in the dashboard.
- Refactored updateDashboard() to no longer require arguments and to use less code. Also removed vanilla javascript code and replaced with jquery
- Tackled the include/exclude functionality. Event listeners had been in place, but fetch() scripts needed to be created and updateDashboard() needed conditional logic to reference the include checkboxes.
- Inserted code for execution when updating items. This code checks whether the grams or ounces amount changed, and if so updates the other measurment accordingly.
- Fixed minor UI design items, to include bootstrap class assignment and changes in javascript.
- Created the splash page
- Addressed mobile responsiveness issues
- Added position sticky to the dashboard so it's always visible
- Added code to prevent duplicate item names within a category
- Discovered newly created items do not have an event listener attached to the update button. Spent some time finding a fix for this.

[Back to Top](#table-of-contents)

## Backplanner Files
Backplanner is a single page website (excluding the borrowed login.html and register.html files). The bulk of code is based in the script.js file, while the page layout is in index.html and the backend work in views.py. Some minor styling was done in styles.css, though most of the styling is based on bootstrap classes. The major components of each file are detailed below.

Various edits and additions were made to Django files such as admin.py and settings.py. These were minor changes to get a fresh Django project working on my system and do not warrant detailed coverage in this document.

### splash.html
The splash page was a final addition to the site and included to improve the perception of agents when they first visit the site. It only loads for users who are not logged in (and potential new users). It is a basic introduction, with login and register buttons for visitors.
### splash.css
All the css for the splash page is here in this separate file. Since The rest of the site was completed I didn't want to worry about any overlap in class or id names, so it was easier to create this separate file. 

splash.css contains minimal css, but it does include a media query that improves text readability on mobile. The need for this arises from a patch of white in the middle of the background image, resulting in the need for increased visibility in the text. I used a text outline hack that I found on Stack Overflow to accomplish this.

### index.html
This file contains the entire functional part of the application (excluding splash.html, login.html, and register.html). Here I employ Django templates to populate the categories and items that are stored for each user in the database. This is accomplished with for loops. When necessary I employ conditional logic to mark inputs as checked.
One issue I couldn't easily resolve (though I think the use of regular expressions could have accomplished it) was the duplication of code blocks between index.html and script.js. For example, the node for a category had to be duplicated within script.js in order to insert the template literals to populate class names and values. The template literals would be placed in the same locations as the django template tags, but I couldn't find an explanation of how to perform that replace.

### layout.html
This page includes the head information for the site, as well as the Bootstrap navbar content. I borrowed the navbar content from a previous assignment, though I did make stylistic changes and included additional content to improve the appearance when collapsed on mobile.

### styles.css
There is very minimal styling in this file. The few items I included are focused on modifying input appearance or accommodating the fixed top navbar. 

### script.js
This file is too large to detail every item included in it. I will provide a general overview with some detailed looks at specific functions or event listeners. All the javascript is contained within window.onload to ensure it doesn't trigger until the page is loaded.

A number of event listeners are at the top of the file. These are attached to basic site functionality elements and are not attached to dynamically generated content.

Standalone functions are also found at the top of the file. These functions were created to reduce code duplication later in the file. Here you will find dashboardUpdate(), which loops over the category cards and items to update the dashboard tables. This is called numerous times later in this file. Next is the event listener that checks values entered in the target weight fields and upon validation sends the data to Python for processing.

The next few code blocks are responsible for creating new categories and attaching functionality to the items contained within the category card.

Several loops follow that attach event listeners to buttons and elements within the category card, specifically focused on item creation, item update, item delete, category delete, and include/exclude functionality.

Finally there are a number of functions that insert html content into the DOM. These include the html for the category card, for new item rows to be added to the item tables within a card, and for new subtotal table rows in the dashboard.

### views.py
I have created nine views to support the application, and borrowed login_view, logout_view, and register from a previous CS50w project to support user accounts.

The first view is basic and supports the splash page. This view checks to see if a user is logged in and if so, redirects them to the main page. 

Next is the index view, which extracts data from the db and passes it to the index template to support content generation.

New_item receives data from the page and creates a new item record within the Item model.

Total_weight receives agent data from the page and updates the User model with the weight and units values from the dashboard.

Return_visitor updates the User model so that the page can load with the 'How it works' section collapsed or expanded as desired.

Update_item receives data from the page and updates the specified item record.

Delete_item deletes the specified record from the Item model

Delete_category deletes all items from the Item model that contain the selected category.

Include function updates the include field of an item. This is necessary on page load to mark items that shouldn't be included in subtotals and totals. This field is essential to the weight tracking feature of the application.

### urls.py
A collection of URL patterns. There is nothing extraordinary here. Nearly all paths are responding to data sent over by javascript.

### models.py
There are two models supporting this application: User and Item. The User model is an extension of AbstractUser, but includes several additional fields. There is 'visited' which evolved to be a boolean to indicate if the user wants the "How It Works" section collapsed on login. 'Weight' represents the agent's target pack weight, and 'units' is the unit of measurement for the target weight.

The Item model includes descriptive information about the items that agents add to their packs. It is linked to the User model, and also has a created field that records the datetime of creation.

[Back to Top](#table-of-contents)
