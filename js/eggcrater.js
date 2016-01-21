var border_size = 0;
var min_size = 15;
var canvas_size_height = 495;
var canvas_size_width = 495;

$(document).ready(function()
{
  var model = new EggCraterModel();
  
  var build_crate = function()
  {
    $("#Vertical-Count").val($("#columns").val() -1);
    $("#Horizonal-Count").val($("#rows").val() -1);
    model.build_crate();
  };
  
  $("#rows,#columns").change(build_crate);
	$("#fixed_size,#spacing").change(
		function()
		{
			$("fieldset.size").toggle();
		}
	);
  $("#update_spacing").click(
    function()
    {
      model.build_crate.call(model);
      return false;
    }
  );
  $("#myCanvas span").click(
    function()
    {
      $('span.clicked').removeClass('clicked');
      $(this).addClass("clicked");
      model.cell_click.call(model);
    }
  );
  
	myProject.Events({
		'beforeChange' :
		function(i)
		{
			if( i.Page == 0)
			{
		    model.make_resizable();
        $("#update_crater").click(
        function()
        {
          model.resize_cell.call(model);
          return false;
        });
			}
			else
			{
				model.unbind('resize');
        $("#myCanvas span,#update_crater").unbind('click');
			}
			return true;
		},
    'onLoad':
    function()
    {
      build_crate();
      $("#update_crater").click(
      function()
      {
        model.build_crate.call(model);
      });
    }
	});

  myProject.Start({Canvas : false});


});

var EggCraterModel = Class.extend
(
	{
    construct : function()
    {
      
    },
    build_crate : function()
    {
    
    var model = this;
 		var $crater = $("#myCanvas");
	  var rows = $("#rows").val();
	  var columns = $("#columns").val();
		$crater.children().remove();
    var dims = this.get_diminsions();
    for ( c = 0 ; c < columns ; c++)
    {
      $row = $("<div id='row_" + c + "'></div>").appendTo($crater);
      if ( c == 0)
      {
        $row.addClass("top");
        $row.css("height",dims.overhang.height);  
      }
      else if ( c == columns -1)
      {
        $row.addClass("bottom");
        $row.css("height",dims.overhang.height);        
      }
      else
      {
        $row.css("height",dims.height);
      }
      $row.addClass("row");
      
      for (j = 0 ; j < rows ; j++)
      {
        $cell = $("<span></span>").appendTo($row);
        if ( j == 0 || j == rows -1 )
        {
          $cell.css("width",dims.overhang.width);  
        }
        else
        {
          $cell.css("width",dims.width);
        }
        if (j % 2 > 0)
        {
          $cell.addClass("resize");
        }
        $cell.css("height",parseFloat($row.css("height")));
        if ( j == rows -1)
        {
          $cell.addClass("end");
        }
				$cell.attr("title","Height : " + 0 + ", Width : " + 0);
      }
    }
	
    this.update_form_values();
    this.refresh_titles($("#myCanvas div.row > span"),'Width');
    this.refresh_titles($("#myCanvas div.row > span"),'Height');
  },
	unbind : function(toUnbind)
	{
		switch(toUnbind.toUpperCase())
		{
			case 'RESIZE':
				$("#myCanvas div.row > span").resizable("disable");
				$("#myCanvas div.row > span").unbind("click");
			break;
		}
	},
	cell_click : function()
	{
    var model = this;
    $elem = $('span.clicked');
		$("#myCanvas span, #myCanvas div").removeClass("moving").removeClass('collateral')
			.removeClass("moving_side").removeClass("moving_top").removeClass("clicked");
		index = jQuery.inArray($elem[0],$elem.parent().children())+1;
		var $this =  $("div span:nth-child(" + index + ")") ;
		$this.prev().addClass('moving_side');
		$this.addClass("moving").next().addClass("collateral");
    $elem.parent().prev().addClass('moving_top');
		$elem.parent().addClass("moving").next().addClass("collateral");
    model.update_custom_textboxes($elem.width(),$elem.parent().height(),$elem.next().width(),
      $elem.parent().next().height());
	},
  make_resizable : function()
  {
    var start;
    var model = this;
    $("#myCanvas div:not(:last)").resizable({
      handles: "s",
      helper: "proxy",
      autoHide: true ,
      start: function(e,ui)
      {
        $this = $(this);
        start = $(this).height();
        model.update_custom_textboxes($this.width(),$this.parent().height(),
          $this.next().width(),$this.parent().next().height());    
      },
      resize: function(e,ui)
      {
        temp_min_size = min_size;
        $this = ui.element;
        height =  ui.size.height;
        var delta = height - start;
        var next_height = $this.next('div').height() - delta
        if (($this.next('div').height() - delta) <= temp_min_size)
        {
          ui.size.height = ($this.next('div').height() - temp_min_size) + start;
          next_height = temp_min_size
        }
        if (height <= temp_min_size)
        {
          ui.size.height = temp_min_size;
          next_height = $this.next('div').height() + ($this.height() - temp_min_size)
        }
        model.update_custom_textboxes($this.width(),ui.size.height,$this.next().width(),next_height);
      },
      stop: function(e, ui)
      {
        $this = ui.element;
        height = $this.height();
        $next = $this.next('div');
        var delta =  height - start;
        $next.add($next.children('span')).css('height',$next.height() - delta + "px");
        $this.children('span').css('height',height + 'px');
        model.refresh_titles($next.children('span').add($this.children('span')),'Height');
        model.update_form_values();
      }
    });
    $("#myCanvas div.row").each(function(i)
    {   
      $(this).children("span:not(:last)").resizable({ 
        handles: "e",
        helper: "proxy",
        autoHide: true ,
        start: function(e,ui)
        {
          start = $(this).width();
        },
        resize: function(e,ui)
        {
          temp_min_size = min_size;
          $this = ui.element;
          width =  ui.size.width;
          var delta = width - start;
          if (($this.next('span').width() - delta) <= temp_min_size)
          {
            ui.size.width = ($this.next('span').width() - temp_min_size) + start;
          }
          if (width <= temp_min_size)
          {
            ui.size.width = temp_min_size;
          }
        },
        stop: function(e, ui)
        {
          $this = ui.element;
          width =  $this.width();
          var delta = width - start;
          $column = $("#myCanvas div > span:nth-child(" + ($this.parent().children().index(this)+1) + ")");
          $next_column = $column.next('span');
          $column.css("width",width + 'px');
          $next_column.css('width', $next_column.width() - delta + "px");
          model.refresh_titles($column.add( $next_column),'Width');
          model.update_form_values();
        }
      });
    });
  },
	resize_cell : function()
	{
		$elem = $("span.clicked");
    var height = this.convert_to_pixels(parseFloat($("#moving_column_height").val()),'height');
		var width = this.convert_to_pixels(parseFloat($("#moving_row_width").val()),'width');
    var height_delta = height - $elem.height();
    var width_delta = width - $elem.width();
    
    if (($elem.next().width() - width_delta) >= min_size && $elem.next().width() >= min_size)
    {
      $column = $("#myCanvas div > span:nth-child(" + ($elem.parent().children().index($elem[0])+1) + ")").add($elem);
      $column.css("width",width + 'px');
      $column.next('span').css('width', $elem.next().width() - width_delta + "px");
      this.refresh_titles($column.add($elem).add( $column.next()),'Width');
    }
    var $next_row = $elem.parent().next('div');
    if (($next_row.height() - height_delta) >= min_size && $next_row.height() >= min_size)
    {
      $row = $elem.parent('div');
      $row.add($row.children('span')).css("height",height + 'px');
      $next_row.add($next_row.children('span')).css('height', $next_row.height() - height_delta + "px");
      this.refresh_titles($row.children('span').add($next_row.children('span')),'Height');
    }
    
    this.update_form_values();
 },
  update_form_values : function()
  {
    var model = this;
    $columns = $("#myCanvas div.row:first span");
    $("#Horizonal-Notches").val("");
    $columns.each(
      function(index,column)
      {
        var curr = $("#Horizonal-Notches").val();
        curr = curr + model.convert_to_units(parseFloat($(column).css('width')),'width') + ",";
        $("#Horizonal-Notches").val(curr);
      }
    );
    $rows = $("#myCanvas div.row > span:first-child");
    $("#Vertical-Notches").val("");
    $rows.each(
      function(index,row)
      {
        var curr = $("#Vertical-Notches").val();
        curr = curr + model.convert_to_units(parseFloat($(row).css('height')),'height') + ',';
        $("#Vertical-Notches").val(curr);
      }
    );
    $("#Vertical-Notches").val($("#Vertical-Notches").val().substring(0,$("#Vertical-Notches").val().length - 1 ));
    $("#Horizonal-Notches").val($("#Horizonal-Notches").val().substring(0,$("#Horizonal-Notches").val().length - 1 ));
    
  },
  update_custom_textboxes : function(width,height,next_width,next_height)
  {
    $("#moving_row_width").val(this.convert_to_units(width,'width'));
    $("#collateral_row_width").val(this.convert_to_units(next_width,'width'));
    $("#moving_column_height").val(this.convert_to_units(height,'height'));
    $("#collateral_column_height").val(this.convert_to_units(next_height,'height')); 
  },
  // side should be either 'Width' or 'Height'
  refresh_titles : function($objects,side)
  {
    var model = this;
    var v = side + " : \\d*.?\\d*";
    var req = new RegExp(v);
    var r = req.toString();
    side_lower = side.toLowerCase()
    $objects.each(
      function()
      {
        $(this).attr("title",$(this).attr("title")
          .replace(req ,side + ' : ' 
          + model.convert_to_units(parseFloat($(this).css(side_lower)),side_lower)));
      }
    );
  },
  
  // Function: convert_to_units
  //    converts the px size of the object to the % of the material piece
  //  Parameters:
  //    value - the number to convert
  //    type -  either 'height' or 'width' depending on where the number is sided
  convert_to_units : function(value,type)
  {
    var layout = this.get_layout_dims();
    var total_px = layout.px[type];
    var total_unit = layout.unit[type];
    
    return Math.round((value/total_px) * total_unit * 1000) / 1000;
  
  },
  convert_to_pixels : function(value,type)
  {
    var layout = this.get_layout_dims();
    var total_px = layout.px[type];
    var total_unit = layout.unit[type];
    
    return Math.round((value/total_unit) * total_px * 1000) / 1000;   
  
  },
  get_layout_dims : function()
  {
    var $crater = $("#myCanvas");
    var rows = $("#rows").val();
	  var columns = $("#columns").val();
    var layout = {
      px:
      {
        width:0,
        height:0
      },
      unit:
      {
        width:0,
        height:0
      }
    };

		if ($("#spacing")[0].checked)
		{
			layout.unit.width = $("#spacing_width").val() * columns;
			layout.unit.height = $("#spacing_height").val() * rows;
		}
		else
		{
			layout.unit.width = $("#fixed_size_width").val();
			layout.unit.height = $("#fixed_size_height").val();			
		}
		if (layout.unit.width > layout.unit.height)
		{
			layout.px.height = (layout.unit.height / layout.unit.width)  * parseFloat(canvas_size_height);
			layout.px.width = parseFloat(canvas_size_width); 
		}
		else
		{
			layout.px.width = (layout.unit.width / layout.unit.height) * parseFloat(canvas_size_width);
			layout.px.height = parseFloat(canvas_size_height); 				
		} 
    return layout;
  },
  get_diminsions : function()
	{
 		var $crater = $("#myCanvas");
    var rows = $("#rows").val();
	  var columns = $("#columns").val();

		var dim = {width:0,height:0,overhang:{width:0,height:0}};
    var layout = this.get_layout_dims();
		$crater.css("height",layout.px.height);
	  $crater.css("width",layout.px.width);
    
    dim.overhang.width = this.convert_to_pixels($("#overhang_length").val(),'width');
    dim.overhang.height = this.convert_to_pixels($("#overhang_length").val(),'height');
    dim.width = (layout.px.width - (2* dim.overhang.width)) / (rows - 2)
		dim.height = (layout.px.height - (2* dim.overhang.height)) / (columns - 2);

		return dim
	}
  }
);
