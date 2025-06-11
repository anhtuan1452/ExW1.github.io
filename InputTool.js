/**
 * InputTool
 * v1.1 13/11/2017 add function do_gl_enable_edit
 * v1.2 16/11/2017 add function do_gl_autocomplete
 * v1.3 19/11/2017 add function do_enable_edit and do_disable_edit
 * v1.4 28/11/2017 DataResult.req_sendable_data now can put data as attribut of ref
 * v1.4 01/04/2017 add function	do_gl_set_input_autocomplete
 */


/**
 * data result class
 * @param hasError
 * @param data
 * @param formData
 * @returns
 */
function DataResult(hasError, data, formData) {
	this.hasError 		= hasError;
	if(hasError) {
		this.data 			= data;
	} else {
		if(data.inpFiles) {
			this.inpFiles = data.inpFiles;
			data.inpFiles = undefined;
		}
		this.data 			= data;
	}

	this.formData		= formData;

	//helper function to have a data which can be sent to server
	this.req_sendable_data = function(ref, objKey) {
		if(!ref) {
			ref = {};
		}
		var sendData = $.extend(true,{}, ref);

		if(objKey) {
			sendData[objKey] = JSON.stringify(this.data);
		} else {
			for(var key in this.data) {
				var value = this.data[key];
				if($.isPlainObject(value) || $.isArray(value)) {
					sendData[key] = JSON.stringify(value);
				} else {
					sendData[key] = value;
				}
			}
		}

		return sendData;
	}

	this.req_sendable_form_data = function(ref) {
		var sendFormData = $.extend(true, {}, this.formData);
		for(var key in ref) {
			var value = ref[key];
			sendFormData.append(key, JSON.stringify(ref[k]));
		}

		return sendFormData;
	}

	this.do_lc_send_data = function(url, header, ref, fSuccess, fError, objName) {
		var that = this;
		var fileInpCount = 0;
		var fileInpTotal = 0;

		var do_send_ajax = function(){
			var sendableData	= that.req_sendable_data(ref, objName);
			App.network.do_lc_ajax (url, header, sendableData, 100000, fSuccess, fError) ;
		}

		var upFileCallback = function() {
			fileInpCount ++;
			if(fileInpCount >= fileInpTotal) {
				do_send_ajax();
			}
		}

		if(this.inpFiles) {
			fileInpTotal = this.inpFiles.length;
			$.each(this.inpFiles, function(i, e) {
				e.do_lc_upload_file(upFileCallback, that.data);
			});
		} else {
			do_send_ajax();
		}

	}
}

var DataType = new function() {
	this.dataType 					= 	{};
	this.errMsg						= 	{};
	this.dataType.numeric			=	{};
	this.dataType.alphanumeric		=	{};
	this.dataType.email				=	{};
	this.dataType.double			=   {};
	this.dataType.alphabetic		=   {};
	this.dataType.alphabetic_utf8	=   {};
	this.dataType.alphanumeric_utf8	= 	{};
	this.dataType.date				= 	{};
	this.dataType.json				= 	{};


	this.dataType.numeric.pattern			=	/^-?[0-9]*$/;
	this.dataType.alphanumeric.pattern		=	/^[a-zA-Z0-9]*$/;
	this.dataType.email.pattern				=	/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

	this.dataType.double.pattern 			=   /^-?\d{0,22}((?:\.|\,)\d{0,15}){0,1}$/;
	this.dataType.alphabetic.pattern		= 	/^[a-zA-Z]*$/;
	this.dataType.alphabetic_utf8.pattern	= 	/^[a-zA-ZâêôûÄéÆÇàèÊÉÀùÌÍÎÏÐîÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿấầăẩẫậ]*$/;
	this.dataType.alphanumeric_utf8.pattern	= 	/^[a-zA-Z0-9âêôûÄéÆÇàèÊÉÀùÌÍÎÏÐîÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]*$/;

	this.dataType.date.pattern_frShort		=	/^[0-3]{1}[0-9]{1}\/[0-1]{1}[0-9]{1}\/[0-9]{4}/;

	this.errMsg.length 						= 	{};

	this.errMsg.required					=	"validator_err_required";

	this.errMsg.length.lt					=	"validator_err_length_lt";
	this.errMsg.length.le					=	"validator_err_length_le";
	this.errMsg.length.gt					=	"validator_err_length_gt";
	this.errMsg.length.ge					=	"validator_err_length_ge";
	this.errMsg.length.eq					=	"validator_err_length_eq";

	this.errMsg.except						=	"validator_err_except";

	this.dataType.numeric.errMsg			=	"validator_err_numeric";
	this.dataType.alphanumeric.errMsg		=	"validator_err_alphanumeric";
	this.dataType.email.errMsg				=	"validator_err_email";
	this.dataType.double.errMsg				=   "validator_err_double";
	this.dataType.alphabetic.errMsg			=   "validator_err_alphabetic";
	this.dataType.alphabetic_utf8.errMsg	=   "validator_err_alphabetic_utf8";
	this.dataType.alphanumeric_utf8.errMsg	=   "validator_err_alphanumeric_utf8";

	this.dataType.date.errMsg				=   "validator_err_date";
	this.dataType.json.errMsg				=   "validator_err_date";

	this.match = function(value, type, format) {
		if(type == "date" && format) {
			if(value.match(this.dataType[type]["pattern_"+format]) != null) {
				return true;
			} else {
				return false;
			}
		}
		if(type == "json"){
			try{
				JSON.parse(value);
				return true;
			}catch (e) {
				return false;
			}
		}    	
		if((this.dataType[type] != undefined) && (value.split(" ").join("").match(this.dataType[type].pattern) == null)) {
			return false;
		} else {
			return true;
		}
	}

	this.req_lc_err_msg = function(type1, type2, type3) {
		var msg = this[type1];
		if(type2) {
			msg = msg[type2];
		}
		if(type3) {
			msg = msg[type3];
		}
		return $.i18n(msg);
	}
}

function DataValidator() {
	this.req_lc_validate_required = function(value) {
		if(value == "" || value == null || value == undefined) {
			return true;
		} else {
			return false;
		}
	}

	this.req_lc_compare = function(value, compare, type, elt, trData) {
		var parts = compare.split(" ");
		if(parts.length >= 2) {
			var operation		= parts[0];
			var error			= false;
			var valToCompare1	= null;
			var valToCompare2	= null;
			valToCompare1 		= parts[1];
			valToCompare1 		= req_lc_convert_compare_value(valToCompare1, type, value, trData);
			if(parts.length > 2) valToCompare2 	= parts[2];
			if(valToCompare2) 	 valToCompare2 	= req_lc_convert_compare_value(valToCompare2, type, value, trData);
			if(type == "date")	{
				try{
					if(elt.is("input")){
						value			= do_lc_get_Date(elt, value);
					}
					value 			= new Date(value).getTime();
					valToCompare1 	= new Date(valToCompare1).getTime();
					if (valToCompare2) valToCompare2 = new Date(valToCompare2).getTime();
				}catch(e){
					console.log("--err parsing date--");
					return true;
				}				
			}
			error 	= 	!req_compare(operation, value, valToCompare1, valToCompare2);			
			return error;
		}
		return false;
	}


	this.req_lc_validate_type = function(value, type, accept, except, dataFormat) {
		var result = false;
		if(accept) {
			//Accepted character (the values that can be in the data value) -> remove them before type check
			if(accept.length > 0) {
				var len = accept.length;
				for (var i = 0; i < len; i++) {
					var index = value.indexOf(accept[i]);
					while(index >= 0) {
						value = req_gl_replace_char_at(value, index, '');
						index = value.indexOf(accept[i]);
					}
				}
			}
		}

		//check the data type
		if(type == "double" || type == "numeric") {
			var tmpValue = value;

			var dVal = 'NaN';
			if(dataFormat) {
				dataFormat 	= dataFormat.trim();
				var parts 	= dataFormat.split(" ");
				if(parts.length == 2) {
					var pformat = parts[1];
					dVal = ''+$.parseNumber(value, {format: pformat, locale:localStorage.language, strict:true}).valueOf();
				}
			} else {
				dVal = '';
			}

			if(DataType.match(value, type) == false || dVal == 'NaN') {
				result = true;
			}

		} else if(type == "date") {
			var date = null;

			var lang = localStorage.language;		
			if (lang==null) lang = "vi";
			var pformat = "";

			if (lang == "fr"){
				pformat = "frShortDate";
			}else if (lang == "en"){
				pformat = "enShortDate";
			}else if (lang=="vi" || lang == "vn"){
				pformat = "viShortDate";
			}			
			
			if(dataFormat) {
				dataFormat 	= dataFormat.trim();
				var parts 	= dataFormat.split(" ");
				if(parts.length == 2) {
					pformat = parts[1];
				}
			}
			
			if(DataType.match(value, type,pformat)) {
				date = req_gl_date_value(value, pformat);
			}
			if(date == null) {
				result = true;
			}

		} else if(DataType.match(value, type) == false) {
			result = true;
		}

		if(result == false && except) {
			if(except.length > 0) {
				var len = except.length;
				var contain = false;
				for (var i = 0; i < len; i++) {
					if(value.indexOf(except[i]) >= 0) {
						contain = true;
					}
				}
				if(contain) {
					result = true;
				}
			}
		}

		return result;
	}

	this.req_lc_validate_length = function(value, dataLength) {
		var lstVal = dataLength.split(" ");
		if(lstVal.length >= 2) {
			var type = lstVal[0];
			var cp = parseInt(lstVal[1]);
			var cp2 = undefined;
			if(lstVal[2]) {
				cp2 = parseInt(lstVal[2]);
			}
			var len = value.length;
			var errMsgLength = "";
			var ok = req_compare(1, type, len, cp, cp2);
			if(ok == false) {
				return true;
			}
		}
	}

	this.do_lc_remove_error_msg = function(dataElt, errMsgAttr) {
		var dataEltErr = errMsgAttr.place;

		if(dataElt.attr("data-rel") == "chosen" && !errMsgAttr.isOther == true) {
			//select with data-rel=chosen must add message to the parent elt
			dataEltErr = dataElt.parent();
		}

		if(dataEltErr.nextAll('.'+errMsgAttr.style_class[0]).length > 0) {
			dataEltErr.nextAll('.'+errMsgAttr.style_class[0]).remove();
		}
	}

	this.do_lc_add_error_msg = function(dataElt, errMsgAttr, errorMsg) {
		var dataEltErr = errMsgAttr.place;
		//create the error message element
		var errMsgElt 	= document.createElement("div");
		$.each(errMsgAttr.style_class, function(i, e) {
			$(errMsgElt).addClass(e);
		})
		$(errMsgElt).html(errorMsg);
		if(dataElt.is(":hidden") && !errMsgAttr.isOther == true) {
			//the element is hidden and the error msg pos is not another place
			// -> do not show the message
			return;
		}

		if(dataElt.attr("data-rel") == "chosen" && !errMsgAttr.isOther == true) {
			//select with data-rel=chosen must add message to the parent elt
			dataEltErr = dataElt.parent();
		}

		if(dataEltErr.nextAll('.'+errMsgAttr.style_class[0]).length > 0) {
			dataEltErr.nextAll('.'+errMsgAttr.style_class[0]).remove();
		}
		dataEltErr.after(errMsgElt);
	}

	var req_lc_convert_compare_value = function(valToCompare, type, value, trData){
		if(type == "date") {			
			if($(valToCompare).length > 0) {
				if($(valToCompare).is("td")) {
					if($(valToCompare).html() == undefined || $(valToCompare).html() == "" || $(valToCompare).html() == null)
						return true;					
				} else {
					if($(valToCompare).val() == undefined || $(valToCompare).val() == "" || $(valToCompare).val() == null)
						return true;					
				}

				if($(valToCompare).is("input")){
					var elt 	 = $(valToCompare);
					valToCompare = $(valToCompare).val();
					valToCompare = do_lc_get_Date(elt, valToCompare);
				}else{
					valToCompare = trData[valToCompare];
				}

			} else if(trData.hasOwnProperty(valToCompare)){
				valToCompare = trData[valToCompare];
			} else {
				valToCompare = value;
			}
		} else if( type == "double" || type == "numeric") {
			if($(valToCompare).length > 0) {
				if($(valToCompare).is("td")) {
					valToCompare = $(valToCompare).html();
				} else {
					valToCompare = $(valToCompare).val();
				}
			} else if(trData.hasOwnProperty(valToCompare)){
				valToCompare = trData[valToCompare];
			} else {
				valToCompare = valToCompare.replace(",", ".");
				valToCompare = valToCompare.replace(" ", "");
			}
			valToCompare = parseFloat(valToCompare);
		} else {
			if($(valToCompare).length > 0) {
				if($(valToCompare).is("td")) {
					valToCompare = $(valToCompare).html();
				} else {
					valToCompare = $(valToCompare).val();
				}
			} else {
				if(trData.hasOwnProperty(valToCompare)) valToCompare = trData[valToCompare];
			}
//			valToCompare = parseInt(valToCompare);
		}

		return valToCompare;
	}

	var req_compare = function(operator, value, valToCompare1, valToCompare2) {
		switch(operator) {
		case "lt":
		case "before":
		case "<":
			if(value < valToCompare1) {
				return true;
			}
			break;
		case "le":
		case "<=":
			if(value <= valToCompare1) {
				return true;
			}
			break;
		case "gt":
		case "after":
		case ">":
			if(value > valToCompare1) {
				return true;
			}
			break;
		case "ge":
		case ">=":
			if(value >= valToCompare1) {
				return true;
			}
			break;
		case "eq":
		case "=":
			if(value == valToCompare1) {
				return true;
			}
			break;
		case "range":
			if(value >= valToCompare1 && value <= valToCompare2) {
				return true;
			}
			break;
		}
		return false;
	}
}

function req_gl_validate(params) {
	var dataElt 		= params.dataElt;
	var showErrMsg 		= params.showError;
	var forcedRequired 	= params.forcedRequired;
	var forcedValue		= params.forcedValue;
	var trData			= params.dataRow;

	if(showErrMsg == undefined) {
		showErrMsg		= true;
	}

	var value	= dataElt.val();

	if(dataElt.is("td")) {
		value = dataElt.html();
	}

	if(forcedValue != undefined) {
		value = forcedValue;
	}

	value = value + "";

	var errorMsg 		= undefined;

	var validation 		= dataElt.attr("data-validation");
	var dataLength 		= dataElt.attr("data-length");
	var except 			= dataElt.attr("data-except");
	var accept 			= dataElt.attr("data-accept");
	var errorMsgRaw 	= dataElt.attr("data-msg");
	var dataFormat	 	= dataElt.attr("data-format");
	var msgPosAttr		= dataElt.attr("data-msgPosition");
	var errMsgClass		= dataElt.attr("data-msgClass");
	var compare			= dataElt.attr("data-compare");

	validator			= new DataValidator();

	//by default the error message will appear after the dataElt
	var errMsgAttr 	= {
			pos : "after",
			place: dataElt,
			style_class : ["errMsg"] 
	}
	if(msgPosAttr) {
		var inpDivParts = msgPosAttr.split(' ');
		if(inpDivParts.length == 2) {
			errMsgAttr.pos 		= inpDivParts[0];
			errMsgAttr.place	= $(inpDivParts[1]);
			errMsgAttr.isOther 	= true;
		}
	}

	if(errorMsgRaw) {
		if(errorMsgRaw == 'none') {
			showErrMsg = false;
		} else {
			errorMsg = {};
			msgPart = errorMsgRaw.split(";");
			msgPart.forEach(function(e, i) {
				msg = e.split(':');
				errorMsg[msg[0]] = msg[1];
			});
		}
	} else {
		errorMsg = undefined;
	}

	var isRequired 	= false;
	var valid 		= 0;

	if(errMsgClass) {
		errMsgAttr.style_class.push(errMsgClass);
	}

	var hasError = false;
	var errMsg	 = "";

	if(forcedRequired) {
		if(!validation) {
			validation = "";
		}
		validation += " required";
	}

	if(validation) {
		validation 	= validation.trim();
		validation 	= validation.replace( /  +/g, ' ' );
		var rIndex 	= validation.indexOf("required");
		var lstType = validation.split(" ");

		if(rIndex >= 0) {
			isRequired = true;
			ri = 0;
			lstType.some(function(e,i) {
				if(e == "required") {
					ri = i;
					return true;
				}
			});

			lstType.splice(ri,1);
		}

		if(isRequired) {
			hasError = validator.req_lc_validate_required(value);
			if(hasError) {
				if(errorMsg && errorMsg.required) {
					errMsg = $.i18n(errorMsg.required);
				} else {
					errMsg = DataType.req_lc_err_msg("errMsg","required");
				}
			}
		}else{
			if(value == "" || value == null || value == undefined) {
				//nodata and not require, remove error and return true
				validator.do_lc_remove_error_msg(dataElt, errMsgAttr);
				return false;
			}
		}

		if(!hasError && lstType.length > 0) {
			hasError = lstType.some(function(e, i) {
				var err = validator.req_lc_validate_type(value, e, accept, except, dataFormat);
				if(err == true) {
					//type error
					if(errorMsg && errorMsg[e]) {
						errMsg = $.i18n(errorMsg[e]);
					} else {
						errMsg = DataType.req_lc_err_msg("dataType",e, "errMsg");
					}
					return true;
				}
			});
		}
	}

	if(!hasError && dataLength) {	//length of the value
		hasError = validator.req_lc_validate_length(value, dataLength);
		if(hasError) {
			var lstVal = dataLength.split(" ");

			if(lstVal.length == 2) {
				var type = lstVal[0];
				var cp 	= parseInt(lstVal[1]);
				if(errorMsg && errorMsg["length"]) {
					errMsg = $.i18n(errorMsg["length"]);
				} else {
					errMsg = DataType.req_lc_err_msg("errMsg","length",type);
				}
				errMsg = sprintf(errMsg,cp)
			}
		}
	}

	if(!hasError && compare) {
		validation 	= validation.trim();
		validation 	= validation.replace( /  +/g, ' ' );
		var rIndex 	= validation.indexOf("required");
		var lstType = validation.split(" ");

		if(rIndex >= 0) {
			isRequired = true;
			ri = 0;
			lstType.some(function(e,i) {
				if(e == "required") {
					ri = i;
					return true;
				}
			});

			lstType.splice(ri,1);
		}

		hasError = validator.req_lc_compare(value, compare, lstType[0], dataElt, trData);

		if(hasError) {
			if(errorMsg && errorMsg.compare) {
				errMsg = $.i18n(errorMsg.compare);
			} else {
				errMsg = DataType.req_lc_err_msg("errMsg","compare");
			}
		}
	}

	if(hasError) {	
		//add error class to the data element
		if(showErrMsg) {
			if(!dataElt.hasClass("inp-error")) {
				dataElt.addClass("inp-error");
			}
		}

		if(!dataElt.hasClass("has-error")) {
			dataElt.addClass("has-error");
		}

		if(showErrMsg) {
			validator.do_lc_add_error_msg(dataElt, errMsgAttr, errMsg);
		}

		return true;
	} else {
		//remove error class from the dataElt
		if(dataElt.hasClass("has-error")) {
			dataElt.removeClass("has-error");
		}
		if(dataElt.hasClass("inp-error")) {
			dataElt.removeClass("inp-error");
		}

		validator.do_lc_remove_error_msg(dataElt, errMsgAttr);
		return false;
	}

	return false;
}

function req_gl_data(option) {

	if(!option) {
		return {error:"option is required"};
	} else {
		var dataZoneDom		= option.dataZoneDom;
		var dataSelector 	= option.dataSelector;
		var showError		= option.showError;
		var exclSelector	= option.exclSelector;
		var wfStep			= option.wfStep;
		var skipError		= option.skipError;
		var removeWhenNull	= option.removeWhenNull;
		var oldObject		= option.oldObject;
		var removeDeleted	= option.removeDeleted;

		if(!dataZoneDom) {
			return {error:"dataZoneDom is required"};
		}

		if(!dataSelector) {
			dataSelector = ".objData";
		}

		if(showError == undefined) {
			showError = true;
		}

		if(skipError == undefined) {
			skipError = false;
		}

		var result 		= {};
		var formData 	= new FormData();
		var lstDataElt = dataZoneDom.find(dataSelector);
		var hasError = false;
		var errorEltList = [];
		lstDataElt.each(function(e, i) {

			var isTd = false;
			if($(this).is("td")) {
				isTd = true;
			}
			if(exclSelector) {
				if($(this).parents(exclSelector).length > 0) {
					return;
				}
				if($(this).hasClass(exclSelector.substring(1))) {
					return;
				}
			}
			if(skipError) {
				//do not validate the value
			} else {
				if(req_gl_validate({dataElt: $(this), showError: showError}) == true) {
					hasError = true;
					errorEltList.push($(this));
				} else if(wfStep) {
					var reqV = $(this).attr("wf_req_v");
					if(reqV) {
						if(reqV.indexOf(wfStep) >= 0) {
							if(req_gl_validate({dataElt: $(this), showError: showError, forcedRequired: true}) == true) {
								hasError = true;
								errorEltList.push($(this));
							}
						}
					}
				} 
			}

			if(!hasError) {
				var key 		= $(this).data("name");
				var group 		= $(this).data("group");
				var value 		= $(this).val();
				var oldValue	= $(this).data("oldValue");
				var groupIndex	= $(this).data("gindex");
				var typ 		= $(this).attr("type");

				if(isTd) {
					value 		= $(this).html(); // add by tran quang chien
				}

				if(value == oldValue) {
					//has no changes
					value = undefined;
				} else {
					if($(this).is("table")) {
						var self_table = $(this);
						if($(this).hasClass("dataTable")) {
							var table = $(this).DataTable();
							if(table) {
								tableData = table.data();
								value = [];
								var primaryCol = $(this).data("primary");
								if(tableData) {
									//check td validity
									var lstTh = $(this).find("th");
									var mapTh = {};
									lstTh.each(function(e1, i1) {
										var thName = $(this).data("name");
										if(thName) {
											mapTh[thName] = $(this);
										}
									});
									$.each(tableData, function(ind, trData) {
										var cells = table.cells(ind, table.columns()[0]);
										cells.every(function() {
											var node 		= $(this.node());
											var cellName 	= node.data("name");
											var cellGroup 	= node.data("group");
											var celGrpIndex	= node.data("gindex");
											var canOverride = false;
											var th			= mapTh[cellName];
											if(mapTh[cellName] && cellName != "action") {
												var visible 	= th.data("visible");
												var editable 	= th.data("editable");
												var excluded 	= th.hasClass("excl");
												if(visible != "false" || editable != "none") {
													if(!excluded) {
														canOverride = true;
													}
												}
											}
											if(canOverride) {
												var cellHtml 	= node.html();
												if (cellHtml) 
													cellHtml	= cellHtml.trim();
												var validation 	= th.data("validation");


												if (cellHtml.length>0 && validation){
													if(validation.indexOf("double") >= 0 || validation.indexOf("number") >= 0 || validation.indexOf("numeric") >= 0 ) {
														cellHtml = cellHtml.split(" ").join("");
														cellHtml = do_lc_get_Number(th, cellHtml);	
													}else if (validation.indexOf("date_time") >= 0) {
														cellHtml = do_lc_get_DateTime($(this), cellHtml);	
													}else if(validation.indexOf("date")>=0){
														cellHtml = do_lc_get_Date($(this), cellHtml);	
													}
												}		
												
												if(cellGroup) {
													if(celGrpIndex !== undefined && celGrpIndex !== "") {
														if(!trData[cellGroup]) {
															trData[cellGroup] = [];
														}

														if(!trData[cellGroup][celGrpIndex]) {
															trData[cellGroup][celGrpIndex] = {};
														}

														trData[cellGroup][celGrpIndex][cellName] = cellHtml;
													} else {
														if(!trData[cellGroup]) {
															trData[cellGroup] = {};
														}
														trData[cellGroup][cellName] = cellHtml;
													}
													
													if(trData.id == null || trData.id <= 0) {
														trData.mode = 1;
													} else if(trData.mode != 3){
														trData.mode = 2;
													}
												} else {
													if(trData[cellName] != cellHtml) {
														if(trData.id == null || trData.id <= 0) {
															trData.mode = 1;
														} else if(trData.mode != 3){
															trData.mode = 2;
														}
													}														
													trData[cellName] = cellHtml;
												}	
											}

										});

										for (var key in trData){
											if (trData.hasOwnProperty(key)) {
												var val = trData[key];
												var th 	= mapTh[key];
												if(th && trData.mode != 3) {													
													if(req_gl_validate({dataElt: th, showError: false, forcedValue: val, dataRow: trData}) == true) {
														hasError = true;
														table.rows(ind).nodes().to$().css("outline","thin solid red");	

														var div = self_table.closest(".tab-pane");
														if(div.length >0 ){
															var id = div.attr("id");
															var a = div.parent().parent().find("a[href='#"+id+"']");
															if(a.length > 0){
																var li = a.parent();
																if(li.length > 0 && !li.hasClass("inp-error"))	li.addClass("inp-error");
															}
														}
													}
												}
											}
										}
										if (hasError) return true;
										//----------filter empty line
										if(trData[primaryCol] == null || trData[primaryCol] == undefined) {
											return true;
										}
										if( typeof trData[primaryCol] === 'string' &&  trData[primaryCol] == "") {
											return true;
										}
										if (removeDeleted){
											if (trData.mode == 3) 
												return true;
										}

										for(var k in trData){
											if(trData[k] && typeof trData[k] == "string"){
												trData[k] = trData[k].split("&nbsp;").join("").trim();
											}
										}
										value.push(trData);	

									});
								}
							}
						}
					}

					var validation = $(this).attr("data-validation"); //this in input or table....
					if(validation && value != "" && !skipError) {
						if(validation.indexOf("double") >= 0 || validation.indexOf("number") >= 0 || validation.indexOf("numeric") >= 0 ) {
							value = do_lc_get_Number($(this), value);
						} else if(validation.indexOf("date_time") >= 0){
							value = do_lc_get_DateTime($(this), value);	
						}else if(validation.indexOf("date") >= 0){
							value = do_lc_get_Date($(this), value);							
						}
					}

					if (typ =="checkbox"){
						if ($(this).is(':checked')) {
							value = 1;
						} else { 
							value = 0; 
						}
					} else if(typ == "file") {
						//get file value from input type file
						var fileInput = $(this).data("file_input");
						if(fileInput) {
//							if($(this)[0].files.length > 0) {
							if(!result.inpFiles) {
								result.inpFiles = [];
							}

							result.inpFiles.push(fileInput);
//							}
						}
						value = [];
					}
				}

				if(removeWhenNull==true && value == '') {
					//to avoid problem of passing parameters in URL
				} else {
					if(group) {
						if(groupIndex !== undefined && groupIndex !== "") {
							if(!result[group]) {
								result[group] = [];
							}

							if(!result[group][groupIndex]) {
								result[group][groupIndex] = {};
							}

							if (key) 	result[group][groupIndex][key] 	= value;
							else		result[group][groupIndex] 		= value;
						} else {
							if(!result[group]) {
								result[group] = {};
							}
							result[group][key] = value;
						}

					} else {
						result[key] = value;
					}
				}

			}

		});
		if($.isEmptyObject(result) || hasError) {
			var data_result = new DataResult(true, errorEltList, undefined);
			return data_result;
		} else {
			if(oldObject) {
				result = $.extend(true, oldObject, result);
			}
//			for (var k in result){
//			if (result.hasOwnProperty(k)) {
//			formData.append(k, JSON.stringify(result[k]));
//			}
//			}

			var data_result = new DataResult(hasError, result, formData);
			return data_result;
		}
	}
};
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
function do_lc_get_Number(ele, value){
	var dataFormat 		= ele.attr("data-format");
	var dataValidation 	= ele.attr("data-validation");
	
	if(dataFormat) {
		dataFormat 	= dataFormat.trim();
		var parts 	= dataFormat.split(" ");
		if(parts.length == 2) {
			var pformat = parts[1];
			value = $.parseNumber(value, {format: pformat, locale:localStorage.language});
			value = value.valueOf();
		}
	} else {
		/**
		 * Replace , to . for double type
		 */
		if(typeof value == "number") {

		} else {
			var i = value.indexOf(',');
			if(i > 0) {
				value = req_gl_replace_char_at(value,i,'.');
			}

			i = value.indexOf(' ');
			if(i > 0) {
				value = req_gl_replace_char_at(value,i,'');
			}
			if (value){
				try{
					if(dataValidation.indexOf("double") >= 0 || dataValidation.indexOf("number") >= 0){
						value = parseFloat(value);
					} else if(dataValidation.indexOf("numeric") >= 0 ){
						value = parseInt(value, 10);
					}
				}catch(e){
					
				}
			}
		}
	}
	return value;		
}

function do_lc_get_Date(ele, value){
	var dataFormat  = ele.attr("data-format");

	var lang = localStorage.language;		
	if (lang==null) lang = "vi";
	var pformat = "";

	if (lang == "fr"){
		pformat = "frShortDate";
	}else if (lang == "en"){
		pformat = "enShortDate";
	}else if (lang=="vi" || lang == "vn"){
		pformat = "viShortDate";
	}			

	if(dataFormat) {
		dataFormat 	= dataFormat.trim();
		var parts 	= dataFormat.split(" ");
		if(parts.length == 2) {
			var pformat = parts[1];
		}
	}
	var date = req_gl_date_value(value, pformat);
	if(date != null) {
//		return date.toFormat(DateFormat.masks.isoDateTime);
		return reg_gl_DateStr_From_DateObj(date, DateFormat.masks.isoDateTime);
	}
	return null;
}

function do_lc_get_DateTime(ele, value){
	var dataFormat  = ele.attr("data-format");

	var lang = localStorage.language;		
	if (lang==null) lang = "vi";
	var pformat = "";

	if (lang == "fr"){
		pformat = "frFullDate";
	}else if (lang == "en"){
		pformat = "enFullDate";
	}else if (lang=="vi" || lang == "vn"){
		pformat = "viFullDate";
	}			

	if(dataFormat) {
		dataFormat 	= dataFormat.trim();
		var parts 	= dataFormat.split(" ");
		if(parts.length == 2) {
			var pformat = parts[1];
		}
	}

	var date = req_gl_date_value(value, pformat);
	if(date != null) {
//		return date.toFormat(DateFormat.masks.isoDateTime);
		return reg_gl_DateStr_From_DateObj(date, DateFormat.masks.isoDateTime);
	}	

	return null;
}
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
var req_gl_date_value = function(value, pformat) {
	//return DateFormat(value, DateFormat.masks[pformat])
	//return luxon.DateTime.fromString(value, DateFormat.masks[pformat]);	
	return reg_gl_DateObj_From_DateStr(value, DateFormat.masks[pformat]);
}

function do_gl_add_validation_event(options) {
	var zone = options.dataZone;
	var event = "blur";
	var showError = true;
	if(options.event) {
		event = options.event;
	}
	if(options.showError) {
		showError = options.showError;
	}
	var lstDataElt = zone.find(".objData");

	lstDataElt.each(function(e, i) {
		if($(this).hasClass('datepicker')) {
			$(this).on("change", function() {
				req_gl_validate({dataElt: $(this), showError: showError});
			});
		}else if($(this).hasClass('datetimepicker')) {
			$(this).on("change", function() {
				req_gl_validate({dataElt: $(this), showError: showError});
			});
		}else if($(this).attr("data-rel") == "chosen") {
			$(this).on("change", function() {
				req_gl_validate({dataElt: $(this), showError: showError});
			});
		} else {
			$(this).on(event, function() {
				req_gl_validate({dataElt: $(this), showError: showError});
			});
		}
	});
}

var req_gl_replace_char_at = function(str,index,replace_with){
	from = index;
	to = from + 1;
	str = str.substr(0,from)+replace_with+str.substr(to, str.length-to);
	return str;
}

var do_gl_select_value = function(selectId, optionValue, domEle) {
	if(domEle) {
		domEle.find(selectId).val(optionValue).change();
	} else {
		$(selectId).val(optionValue).change();
	}
};

/**
 * Disable editing of all objData and action-btn in a Div
 * @param jquery DOM
 */
var do_gl_disable_edit = function(div, dataSelector) {
	if(dataSelector === undefined) {
		dataSelector = ".objData";
	}
	var lstElt = null;
	if (dataSelector.indexOf("#")>=0)
		lstElt = div.find(dataSelector);
	else 
		lstElt = div.find(dataSelector + ", .action-btn" + ", .editable");

	if(div.is(dataSelector)) {
		$.merge(lstElt,div);
	}
	lstElt.each(function(i, e) {
		var elt = $(this);
		if(elt.is("td")) {
			elt.removeAttr("contenteditable");
		} else if(elt.hasClass("action-btn")) {
			elt.addClass("not-active");
		} else {
			elt.attr("disabled", true);
		}

		if(elt.data("rel") == "chosen") {
			elt.trigger("liszt:updated");
		}

		if(elt.hasClass("fileinput")) {
			if(elt.fileinput) {
				elt.fileinput("disable");
			}
		}

	});
}

/**
 * Enable editing of all objData and action-btn in a Div
 * @param jquery DOM
 */
var do_gl_enable_edit = function(div, dataSelector, curMode) {
	if(dataSelector === undefined) {
		dataSelector = ".objData";
	}

	var lstElt = null;
	if (dataSelector.indexOf("#")>=0)
		lstElt = div.find(dataSelector);
	else 
		lstElt = div.find(dataSelector + ", .action-btn" + ", .editable");

	if(div.is(dataSelector)) {
		$.merge(lstElt,div);
	}

	lstElt.each(function(e, i) {
		var elt = $(this);
		//Skip input hidden
		if(elt.is("input") && elt.attr("type") == "hidden") {
			return true;
		}
		//Skip table header
		if(elt.is("th")) {
			return true;
		}

		//Skip unmodifiable 
		if(elt.hasClass("unmodifiable") || elt.parents(".unmodifiable").length > 0) {
			do_gl_disable_edit(elt, dataSelector);
			return true;
		}

		if(elt.is("td")) {
			elt.attr("contenteditable", "true");
		} else if(elt.hasClass("action-btn")) {
			elt.removeClass("not-active");
		} else {
			elt.removeAttr("disabled");
		}

		if(elt.data("rel") == "chosen") {
			elt.trigger("liszt:updated");
		}

		if(elt.hasClass("fileinput")) {
			if(elt.fileinput) {
				elt.fileinput("enable");
			}
		}

		var unableedit_mode = $(this).data('disable');
		if(unableedit_mode) {
			if(unableedit_mode == curMode) {
				do_gl_disable_edit($(this), dataSelector);
			}
		}

	});
}

var req_gl_double_value = function(val, format) {
	var result = 0;

	if(!format) {
		format = "#,###.##";
	}

	try{
		result = $.parseNumber(""+val, {format: format, locale:localStorage.language}).valueOf();
	}catch(e){
		console.log("---- err when parseNumber of : " + val )
	}

	return result;
}

var do_gl_autocomplete = function(options) {
	var defaultOptions = {
			placeholder		: $.i18n("common_placeholder_autocomplete"),
			displayAttrLst 	: undefined,	
			renderAttrLst 	: undefined,
			dataZone		: undefined,
			source			: undefined,
			autoFocus 		: true,
			selectCallback	: undefined,
			focusCallback	: undefined,
			customRender	: undefined,
			minLength		: 0,
			required 		: false,
			autoSearch 		: true,
			autoSelect		: false,
			delay			: 600,
	}

	var autoCompleteOpts = $.extend(true, {}, defaultOptions, options);

	if(!autoCompleteOpts.el) {
		console.log("AutoComplete's option el is required");
		return;
	}

	if(!autoCompleteOpts.renderAttrLst) {
		console.log("AutoComplete's option renderAttrLst is not set, default value is 'name'");
		autoCompleteOpts.renderAttrLst = ["name"];
	}

	var el 				= autoCompleteOpts.el;
	var placeholder 	= autoCompleteOpts.placeholder;
	var displayAttrLst	= autoCompleteOpts.displayAttrLst;
	var renderAttrLst	= autoCompleteOpts.renderAttrLst;
	var dataZone 		= autoCompleteOpts.dataZone;
	var source			= autoCompleteOpts.source;
	var autoFocus		= autoCompleteOpts.autoFocus;
	var selectCallback	= autoCompleteOpts.selectCallback;
	var focusCallback	= autoCompleteOpts.focusCallback;
	var customRender	= autoCompleteOpts.customRender;
	var minLength		= autoCompleteOpts.minLength;
	var required		= autoCompleteOpts.required;
	var autoSearch		= autoCompleteOpts.autoSearch;
	var autoSelect		= autoCompleteOpts.autoSelect
	var selected 		= false;
	var displayLine		= autoCompleteOpts.displayLine;

	var source_funct 	= source;
	var arr_source		= [];
	if(!$.isFunction(source)) {
		arr_source = source;
		source_funct = function(request, response) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");

			var arr_filtered = [];
			$.each(arr_source, function(i, e) {
				if(e) {
					var attr = renderAttrLst[0];
					if(matcher.test(e[attr])) {
						arr_filtered.push(e);
					}
					if(displayLine){
						if(arr_filtered.length == displayLine)
							return false;
					}
				}
			});
			response(arr_filtered);
		}
	}

	$(el).attr("placeholder", placeholder);

	el.autocomplete({
		source 		: source_funct, 
		autoFocus	: autoFocus, 
		minLength	: minLength,	
		selectFirst	: true,
		open		: function(event, ui) {
			if(selected) {
				selected = false;
			}
		},
		select		: function( event, ui ) {
			selected = true;
			if(dataZone) {
				for (var key in ui.item){
					if (ui.item.hasOwnProperty(key)) {
						var dz 		= dataZone.find("[data-name='"+key+"']");
						if(dataZone.is("tr")) {
							dz 		= dataZone.find("."+key);
						}

						var value 	= ui.item[key];
						if(dz.is("input")) {
							dz.val(value);
						} else {
							dz.html(value);
						}
					}
				}
			}

			if(selectCallback) {
				selectCallback(ui.item);
			}

			if(el.is("input")) {
				if (displayAttrLst){
					el.val(ui.item[displayAttrLst[0]]);
				}else{
					el.val(ui.item[renderAttrLst[0]]);
				}				
			} else {
				if (displayAttrLst){
					el.html(ui.item[displayAttrLst[0]]);
				}else{
					el.html(ui.item[renderAttrLst[0]]);
				}				
			}

			el.blur();

			return false;
		},
		focus: function( event, ui ) {
			if(focusCallback) {
				focusCallback(event, ui);
			}
			return false;
		},
		change:function(event,ui){  

		}
	}).autocomplete( "instance" )._renderItem = function( ul, item ) {
		var selOpt = "<div>";
		$.each(renderAttrLst, function(i, e) {
			selOpt += " " + item[e];
		});

		selOpt += "</div>";
		return $( "<li>" ).append( selOpt ).appendTo( ul );
	};

	if(autoSearch == true) {
		el.on("focus", function() {
			$(this).autocomplete("search", $(this).html());
		});
	}

	/* Neu required thi chon value dau tien trong list, cai nay khong dung
	if(required) {
		el.blur(function(){
			if(!selected){
				var ac_ul = el.autocomplete( "widget" );
				var ac_li = ac_ul.find("li");
				if(ac_li.length > 0) {
					$(ac_li[0]).trigger('click');
				} else {
					el.html("");
				}
				selected = false;
			}

			return true;
		}); 
	}
	 */
//	if(autoSelect) {
//	var ac_ul = el.autocomplete( "widget" );
//	var ac_li = ac_ul.find("li");
//	if(ac_li.length > 0) {
//	$(ac_li[0]).trigger('click');
//	} else {
//	el.html("");
//	}		
//	}
}

var do_gl_autocomplete_new = function(options) {
	var defaultOptions = {
			placeholder		: $.i18n("common_placeholder_autocomplete"),
			displayAttrLst 	: undefined,	
			renderAttrLst 	: undefined,
			dataZone		: undefined,
			source			: undefined,
			autoFocus 		: true,
			selectCallback	: undefined,
			focusCallback	: undefined,
			customRender	: undefined,
			minLength		: 0,
			required 		: false,
			autoSearch 		: true,
			autoSelect		: false,
			delay			: 600,
	}

	var autoCompleteOpts = $.extend(true, {}, defaultOptions, options);

	if(!autoCompleteOpts.el) {
		console.log("AutoComplete's option el is required");
		return;
	}

	if(!autoCompleteOpts.renderAttrLst) {
		console.log("AutoComplete's option renderAttrLst is not set, default value is 'name'");
		autoCompleteOpts.renderAttrLst = ["name"];
	}

	var el 				= autoCompleteOpts.el;
	var placeholder 	= autoCompleteOpts.placeholder;
	var displayAttrLst	= autoCompleteOpts.displayAttrLst;
	var renderAttrLst	= autoCompleteOpts.renderAttrLst;
	var dataZone 		= autoCompleteOpts.dataZone;
	var source			= autoCompleteOpts.source;
	var autoFocus		= autoCompleteOpts.autoFocus;
	var selectCallback	= autoCompleteOpts.selectCallback;
	var focusCallback	= autoCompleteOpts.focusCallback;
	var customRender	= autoCompleteOpts.customRender;
	var minLength		= autoCompleteOpts.minLength;
	var required		= autoCompleteOpts.required;
	var autoSearch		= autoCompleteOpts.autoSearch;
	var autoSelect		= autoCompleteOpts.autoSelect
	var selected 		= false;
	var displayLine		= autoCompleteOpts.displayLine;
	var appendTo		= autoCompleteOpts.appendTo;

	var source_funct 	= source;
	var arr_source		= [];
	if(!$.isFunction(source)) {
		arr_source = source;
		source_funct = function(request, response) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");

			var arr_filtered = [];
			$.each(arr_source, function(i, e) {
				if(e) {
					var attr = renderAttrLst[0];
					if(matcher.test(e[attr])) {
						arr_filtered.push(e);
					}
					if(displayLine){
						if(arr_filtered.length == displayLine)
							return false;
					}
				}
			});
			response(arr_filtered);
		}
	}

	$(el).attr("placeholder", placeholder);

	el.autocomplete({
		source 		: source_funct, 
		autoFocus	: autoFocus, 
		minLength	: minLength,	
		appendTo	: appendTo,
		selectFirst	: true,
		open		: function(event, ui) {
			if(selected) {
				selected = false;
			}
		},
		select		: function( event, ui ) {
			selected = true;
			if(dataZone) {
				for (var key in ui.item){
					if (ui.item.hasOwnProperty(key)) {
						var dz 		= dataZone.find("[data-name-zone='"+key+"']");
						if(dataZone.is("tr")) {
							dz 		= dataZone.find("."+key);
						}

						var value 	= ui.item[key];
						if(dz.is("input")) {
							dz.val(value);
						} else {
							dz.html(value);
						}
					}
				}
			}

			if(selectCallback) {
				selectCallback(ui.item);
			}

			if(el.is("input")) {
				if (displayAttrLst){
					el.val(ui.item[displayAttrLst[0]]);
				}else{
					el.val(ui.item[renderAttrLst[0]]);
				}				
			} else {
				if (displayAttrLst){
					el.html(ui.item[displayAttrLst[0]]);
				}else{
					el.html(ui.item[renderAttrLst[0]]);
				}				
			}

			el.blur();

			return false;
		},
		focus: function( event, ui ) {
			if(focusCallback) {
				focusCallback(event, ui);
			}
			return false;
		},
		change:function(event,ui){  

		}
	}).autocomplete( "instance" )._renderItem = function( ul, item ) {
		var selOpt = "<div>";
		$.each(renderAttrLst, function(i, e) {
			selOpt += " " + item[e];
		});

		selOpt += "</div>";
		return $( "<li>" ).append( selOpt ).appendTo( ul );
	};

	if(autoSearch == true) {
		el.on("focus", function() {
			$(this).autocomplete("search", $(this).html());
		});
	}
}

var do_gl_set_input_autocomplete = function(div, options, oData){
	var functSource		= options.sourceFunct;		//source array for choose 
	var arrSource 		= options.source;			//source array for choose 
	var dataSel 		= options.dataSel;			//push value of item on other input if autocomplete input
	var dataTab 		= options.dataTab;			//push value of item on data row of datatable
	var succesCallback 	= options.succesCallback;	//if after select item, we have function callback
	var callbackParams 	= options.callbackParams;	//array of param for callback
	var dataService 	= options.dataService;		//service for send request
	var dataReq 		= options.dataReq;			// attribute accompagne for send request
	var dataRes 		= options.dataRes;			//bind attribute for list reponse
	var oldLst 			= options.oldLst;			//filtre the same item
	var dz 				= options.dataZone;			//bind value when click the item
	var placeholder		= options.placeholder;		//Set custom placeholder on input
	var autoS 			= options.autoSearch;		//Set input or td autoSearch or no.
	var length 			= options.minLength;		//Set input or td autoSearch or no.
	var required 		= options.required;			//Set input or td autoSearch or no.
	var canAdd 			= options.canAdd;			//Can add new entity or no.
	var addRight 		= options.addRight;			//Can add new entity or no.
	var addCallback 	= options.addCallback;		//Can add new entity or no.
	var autoSel			= options.autoSelect;

	if(required == null)	required = true;
	if(length == null)		length = 0;
	if(autoS == null)		autoS = true;
	var obj 			= dz && $(dz).is("td") ? $(div).parent() : $(dz);

	do_gl_autocomplete({
		el		: $(div),
		required: required,
		source 	: function(request, response) {
//			if (functSource){
//			functSource.apply(null, [request, response]);
//			return;
//			}

			if(arrSource){
				if(typeof(arrSource) == "function"){
					arrSource(oData, function(list){
						if(oldLst) list = do_delete_element_duplicate(oldLst, list);
						if(canAdd){
							options.data = arrSource;
							do_gl_req_list(request, response, list, addRight, dataRes);
						} else {
							response($.ui.autocomplete.filter(list, request.term));
						}
					})
				}else{
					if(oldLst) arrSource = do_delete_element_duplicate(oldLst, arrSource);
					if(canAdd){
						options.data = arrSource;
						do_gl_req_list(request, response, arrSource, addRight, dataRes);
					} else {
						response($.ui.autocomplete.filter(arrSource, request.term));
					}
				}
			}else{
				do_search_article(request, response, options, div, oData);
			}
		},
		selectCallback: function(item) {
			var result = true;

			if(canAdd)	result = do_gl_select_row_default(item, addCallback.fadd, addCallback.fPa);
			if(!result)	return false;

			if(dataSel && !$.isEmptyObject(dataSel)){
				for(var key in dataSel){
					if($(key).is("input")){
						$(key).val(item[dataSel[key]]);
					} else if($(key).is("td")){
						$(key).html(item[dataSel[key]]);
					}

				}
			}
			if(oData){
				if(dataTab && !$.isEmptyObject(dataTab)){
					for(var key in dataTab){
						oData[key] = item[dataTab[key]];
					}
				}
			}
			if(succesCallback){
				if (callbackParams) {
					var param = [item].concat(callbackParams);									
					succesCallback.apply(null, param);
				}else
					succesCallback(item);
			}
			return false;
		},
		placeholder		: placeholder,
		displayAttrLst	: ["displ"],
		renderAttrLst	: ["label"],
		minLength		: length,
		autoSearch		: autoS,
		dataZone		: obj,
		autoSelect		: autoSel
	})
}

var do_search_article = function(request, response, options, div, oData) {
	var dataService = options.dataService;//service for send request
	var dataReq		= options.dataReq;// attribute accompagne for send request
	if(dataService.length == 0) return;
	var ref 		= req_gl_Request_Content_Send(dataService[0], dataService[1]);	
	ref.searchkey	= request.term;
	if(typeof(options.autoSearch) == "boolean" && options.autoSearch == false && request.term.trim() == "")	return false;
	if(dataReq && !$.isEmptyObject(dataReq)) {
		for(var key in dataReq){
			ref[key]		= dataReq[key];
		}
	}

	var fSucces		= [];
	fSucces.push(req_gl_funct(null, do_search_article_response, [request, response, options, div, oData]));

	var fError 					= req_gl_funct(null, do_gl_show_Notify_Msg_Error, [$.i18n("common_err_ajax")]);	
	var var_lc_URL_Aut_Header	= req_gl_Security_HttpHeader (App.keys.KEY_STORAGE_CREDENTIAL);
	var_lc_URL_Aut_Header	= {
		Authorization: "Bearer " + var_lc_URL_Aut_Header,
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	}
	var apiRoute = options.apiRoute;
	if (!apiRoute) if (options.dataService[0].charAt(0)=="/") apiRoute = options.dataService[0];
	if (!apiRoute) apiRoute = "";
	App.network.do_lc_ajax_background (App.path.BASE_URL_API + apiRoute, var_lc_URL_Aut_Header, ref, 100000, fSucces, fError) ;	
}

var do_search_article_response = function(sharedJson, request, response, options, div, oData) {
	if(sharedJson[App['const'].SV_CODE] == App['const'].SV_CODE_API_YES) {	
		var data 		= sharedJson[App['const'].RES_DATA];	
		var dataRes		= options.dataRes;
		var oldLst 		= options.oldLst;
		var canAdd 		= options.canAdd;		
		var addRight	= options.addRight;

		if(oldLst) data = do_delete_element_duplicate(oldLst, data);

		$.each(data, function(i, o){
			var label = "";
			if(o[dataRes[0]])
				label = '<b>' + o[dataRes[0]]+'</b>';
			for(var i = 1; i<dataRes.length;i++){
				if(o[dataRes[i]])
					label = label + ' ' + o[dataRes[i]];
			}
			o.label 	=  label;
			if(o[dataRes[1]] != null && o[dataRes[1]] != ""){
				o.displ 	= o[dataRes[1]];
			} else {
				o.displ 	= o[dataRes[0]];
			}
		})
		if(canAdd){
			do_gl_req_list(request, response, data, addRight, dataRes);
		} else {
			response(data);
		}
	}
}

function do_gl_req_list(request, response, list, addRight, opShows){
	var lst	 		= [];
	lst 			= list;

	var attr01 = opShows[0];
	var attr02 = opShows[1];

	var lstS = $.ui.autocomplete.filter(lst, request.term);

	if(App.data.user.rights.includes(parseInt(addRight,10))){
		var item 	= {[attr01] : "-------------------------------------", [attr02]: "", action: ""};
		item.label = item[attr01];
		lstS.unshift(item);

		item 	= {[attr01] : "<div class='item-custom'><i class='fa fa-plus'></i> " + $.i18n("common_add_entity_autocomplete")+ "</div>", [attr02]: "", action: "add"};
		item.label = item[attr01];
		lstS.unshift(item);

		if(lstS.length == 2){
			var item 	= {[attr01] : $.i18n("common_empty_entity_autocomplete"), [attr02]: "", action: "msg"};
			item.label = item[attr01];
			lstS.push(item);
		}
	} else {
		if(lstS.length == 0){
			var item 	= {[attr01] : $.i18n("common_empty_entity_autocomplete"), [attr02]: "", action: "msg"};
			item.label = item[attr01];
			lstS.push(item);
		}
	}

	response(lstS);
}

function do_gl_select_row_default(item, callback, params){
	if(item.action == "add"){
		callback.apply(this, params);
		return false;
	} else if(item.action == "msg"){
		return false;
	}
	return true;
}

function do_delete_element_duplicate(oldLst, newList){
	var nameId  = (oldLst.length == 1)? "id" : oldLst[1];
	var list    = oldLst[0];
	$.each(list, function(i, o){
		for(var j 	= newList.length-1; j>= 0; j--){
			if(o[nameId] == newList[j].id){
				newList.splice(j,1);
			}
		}
	})
	return newList;
}

var replaceHtmlEntites = (function(str) {
	var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	var translate = {
			"nbsp"	: " ",
			"amp"	: "&",
			"quot"	: "\"",
			"lt"	: "<",
			"gt"	: ">"
	};
	return function(str) {
		return (str.replace(translate_re,
				function(match, entity) {
			return translate[entity];
		}));
	}
})();

var do_gl_reqRandom_number = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

var do_gl_req_autocompleteNew = function(div, options){
	let el = $(div);
	let {dataSrc, autoFocus = false, selectFirst = true, appendTo, fSelect, minLength = 1, dataService: [serviceClass, serviceName], customShowList} = options;

	var do_getLst_article = function(request, response) {
		if(!serviceClass || !serviceName)	return false;
		let ref 		= req_gl_Request_Content_Send(serviceClass, serviceName);	
		ref.searchkey	= request.term;self

		let fSucces		= [];
		fSucces.push(req_gl_funct(null, do_req_article_response, [request, response]));

		let fError 					= req_gl_funct(null, do_gl_show_Notify_Msg_Error, [$.i18n("common_err_ajax")]);	
		let var_lc_URL_Aut_Header	= req_gl_Security_HttpHeader (App.keys.KEY_STORAGE_CREDENTIAL);
		var_lc_URL_Aut_Header	= {
			Authorization: "Bearer " + var_lc_URL_Aut_Header,
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
		var apiRoute = options.apiRoute;
		if (!apiRoute) apiRoute = options.dataService[0];
		if (!apiRoute) apiRoute = "";

		App.network.do_lc_ajax_background (App.path.BASE_URL_API + serviceClass, var_lc_URL_Aut_Header, ref, 100000, fSucces, fError) ;	
	}

	var do_req_article_response = function(sharedJson, request, response) {
		if(sharedJson[App['const'].SV_CODE] == App['const'].SV_CODE_API_YES) {	
			let data 		= sharedJson[App['const'].RES_DATA];	
			if(!data.length)	data.push({"noData": false});
			response(data);
		}
	}

	el.autocomplete({
		source 		: function(request, response){
			if(!dataSrc)	do_getLst_article(request, response);
			if(typeof(dataSrc) == "array"){
				response($.ui.autocomplete.filter(arrSource, request.term));
			}else{
				do_getLst_article(request, response);
			}
		},
		autoFocus	: autoFocus, 
		minLength	: minLength,	
		selectFirst	: selectFirst,
		appendTo	: appendTo,
		select		: function(event, ui) {
			let item = ui.item;
			if(item.noData === false)	return false;
			fSelect(event, item);
			return false;
		},
		messages : {
			noResults : '',
			results : function(count) {
				return '';
			}
		},
	}).autocomplete( "instance" )._renderItem = function( ul, item) {
		let selOpt 		= "<div>";
		if(item.noData === false){
			selOpt 		+= " No Result ";
		}else{
			if(customShowList)	selOpt += customShowList(item);
		}
		selOpt 			+= `</div>`;

		return $( "<li>" ).append( selOpt ).appendTo( ul );
	};
}

