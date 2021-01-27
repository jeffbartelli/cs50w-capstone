# Backplanner (An app for tracking backpack & pannier weight)
## cs50w-capstone

## Table of Contents
[Capstone Requirements](#capstone-requirements)

[How To Run This Application](#how-to-run-this-application)

[Backplanner Introduction](#backplanner-introduction)

[Backplanner Introduction](#backplanner-introduction)

[Backplanner Development Requirements](#backplanner-development-requirements)

[Backplanner Files](#backplanner-files)

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

## How To Run This Application
1. Copy the repo to your system.
2. Using the command line, navigate to the folder that contains this repo.
3. Verify you have Python and Django installed on your system. If not you will need to load them.
4. Use ```python manage.py runserver``` to open the site.

## Backplanner Introduction
Like many of the websites I've built in the past, Backplanner is based on a Google Sheets tool I built to record the weight of each item of camping gear I have, and to allow me to track what items I plan to carry with me on backpacking and bike touring trips. Ultimately the tool helps me to cut weight when necessary and to identify items that aren't worth the trouble to carry. Other people have used copies of that original tool and it was clear that it was a good candidate for my capstone project.

Backplanner has a robust user interface built in HTML, leaning heavily on bootstrap for its formatting and javascript/jquery for its user interface. The Django templates allow for simple generation of content on page load, pulling data from the database through the view functions I wrote. Records are updated by using javascript's fetch() function to send data to Django for parsing and insertion into the database. *This use of Django on the back-end and javascript on the front-end meets the CS50w requirement*. While I have built on the lessons I learned in CS50w to complete this capstone project, *this website was built from the ground up and has little in common with any CS50w projects*.

To the best of my knowledge I have not included any Python libraries or packages outside of the standard Python library. Therefore, *no requirements.txt file is required for this project*.

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

### styles.css
There is very minimal styling in this file. The few items I included are focused on modifying input appearance or accommodating the fixed top navbar. 

### script.js


### views.py


### models.py


### urls.py