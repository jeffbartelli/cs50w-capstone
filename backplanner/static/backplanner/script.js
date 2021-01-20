window.onload = function() {

    $('#howItWorksExpand').on('click', (e)=>{
        let $unit = $('#howItWorksExpand');
        if ($unit.hasClass('bi-arrow-down-square')) {
            $unit.removeClass('bi-arrow-down-square').addClass('bi-arrow-up-square');
        } else {
            $unit.removeClass('bi-arrow-up-square').addClass('bi-arrow-down-square'); 
        }
    });

    $('#targetWeight').on('blur', (e)=>{
        // confirm contents are numbers
        // retrieve units (do I add this to the model?)
        // send to db if value is realistic, else alert warning
        alert('test target weight');
    });

    $('#create-category').on('keyup', (e)=>{
        if ($('#create-category').val().length > 0) {
            $('#category-submit').prop('disabled', false);
        } else {
            $('#category-submit').prop('disabled', true);
        }
    });

    $('#category-submit').on('click', ()=>{
        let $name = $('#create-category').val();
        // Check if name is unique. If not then alert and reject
        categoryGen($name);
    });

    $('#item-submit').on('click', (e)=>{
        // confirm all three fields are populated
        // confirm numbers in qty and weight
        // send values to db
        // insert row into section table
    });

    let categoryGen = (name) => {
        let $display = name.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        let $name = name.toLowerCase();

        let $node = `<div class="category-${$name} card mt-1"><div class="card-header d-flex justify-content-between" id="${$name}" style="background-color: gold;"><span class="h4">${$display}</span><i class="bi bi-x-square ml-1 delete"></i></div><div class="card-body"><table class="table table-hover table-sm"><thead><tr><th>Include</th><th>Item Description</th><th>QTY</th><th>Grams</th><th>Ounces</th><th>Delete</th></tr></thead><tbody class="${$name} tbod"></tbody></table><div class="${$name} item d-flex justify-content-center p-1 border rounded"><div class="mr-1"><span>Create A New Item: </span><input type="text" class="${$name} description"></div><div class="mr-1"><span>Quantity: </span><input type="text" class="${$name} quantity" size="3"></div><div class="mr-1"><span>Weight: </span><input type="text" min="0" size="5"><span>Units: </span><input type="radio" name="targetUnits" id="${$name}-grams" value="grams" checked><label for="${$name}-grams"> g</label><input type="radio" name="targetUnits" id="${$name}-ounces" value="ounces"><label for="${$name}-ounces"> oz</label></div><input type="submit" value="Create" class="ml-1 btn btn-outline-secondary btn-sm item-submit" disabled></div></div></div>`;

        $($node).hide().insertBefore('#category-generator').slideDown('slow');
        $('#create-category').val('');
        $('#category-submit').prop('disabled', true);

        let $row = (`<tr><th scope="row">${$display}</th><td>0</td><td>0</td><td>0</td></tr>`);
        $($row).appendTo('#category-dash');
    }

    $('i.delete').on('hover', ()=>{
        // change pointer and highlight icon
    });

    $('i.delete').on('click', ()=>{
        // open modal to confirm section delete.
        // if confirmed then delete section from page
        // delete all items with matching section from db
    })

}