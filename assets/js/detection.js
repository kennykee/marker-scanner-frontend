function getROI(original_image){
    
    /* Convert to black and white */
    let capture = new cv.Mat();
    cv.cvtColor(original_image, capture, cv.COLOR_RGB2GRAY, 0);
    cv.threshold(capture, capture, 128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
    cv.threshold(capture, capture, 127, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C);
    
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(capture, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
    
    /* Choose biggest bounding rectangle */
    let bounding_coordinate = {}; //top_left, top_right, bottom_left, bottom_right (0,0)
    let final_contour = {};

    let top_x = capture.cols;
    let top_y = capture.rows;
    let bottom_x = 0;
    let bottom_y = 0;

    /* Don't have child */
    for (let idx = 0; idx < contours.size(); ++idx) {

        let contour = contours.get(idx);
        let hier = hierarchy.intPtr(0, idx);

        if(hier[2] == -1){
            
            let marker_result = getMarkerPosition(contour); // {position,x,y,w,h}
            
            let {x,y,w,h} = marker_result;

            if(marker_result["position"] == "top_left"){
                if("top_left" in bounding_coordinate){
                    if(x - bounding_coordinate["top_left"][0] + y - bounding_coordinate["top_left"][1] < 0){
                        bounding_coordinate["top_left"] = [x,y,w,h];
                        final_contour["top_left"] = contour;
                    }
                }else{
                    bounding_coordinate["top_left"] = [x,y,w,h];
                    final_contour["top_left"] = contour;
                }
                top_x = x < top_x ? x : top_x;
                top_y = y < top_y ? y : top_y;
            
            }else if(marker_result["position"] == "top_right"){
                if("top_right" in bounding_coordinate){
                    if(x - bounding_coordinate["top_right"][0] - (y - bounding_coordinate["top_right"][1]) > 0){
                        bounding_coordinate["top_right"] = [x,y,w,h];
                        final_contour["top_right"] = contour;
                    }
                }else{
                    bounding_coordinate["top_right"] = [x,y,w,h];
                    final_contour["top_right"] = contour;
                }
                
                top_y = y < top_y ? y : top_y;
                bottom_x = (x + w) > bottom_x ? (x + w) : bottom_x;

            }else if(marker_result["position"] == "bottom_left"){
                if("bottom_left" in bounding_coordinate){
                    if(-(x - bounding_coordinate["bottom_left"][0]) + (y - bounding_coordinate["bottom_left"][1]) > 0){
                        bounding_coordinate["bottom_left"] = [x,y,w,h];
                        final_contour["bottom_left"] = contour;
                    }
                }else{
                    bounding_coordinate["bottom_left"] = [x,y,w,h];
                    final_contour["bottom_left"] = contour;
                }
                top_x = x < top_x ? x : top_x;
                bottom_y = (y+h) > bottom_y ? (y+h) : bottom_y;

            }else if(marker_result["position"] == "bottom_right"){
                if("bottom_right" in bounding_coordinate){
                    if(x - bounding_coordinate["bottom_right"][0] + y - bounding_coordinate["bottom_right"][1] > 0){
                        bounding_coordinate["bottom_right"] = [x,y,w,h]
                        final_contour["bottom_right"] = contour;
                    }
                }else{
                    bounding_coordinate["bottom_right"] = [x,y,w,h];
                    final_contour["bottom_right"] = contour;
                }
                bottom_x = (x+w) > bottom_x ? (x+w) : bottom_x;
                bottom_y = (y+h) > bottom_y ? (y+h) : bottom_y;
            }
        }
    }

    if (Object.keys(bounding_coordinate).length == 0){
        return {
            mat: false,
            rectangle_image: false, 
            black_count: 0, 
            white_count: 0, 
            marker_image: false, 
            visible_corner: 0, 
            marker_color: ""}
    }

    let width_ratio = 0.2346939;
    let height_ratio = 0.2263158;

    if(top_x == capture.cols){
        let corner_width = "top_right" in bounding_coordinate? bounding_coordinate["top_right"][2] : bounding_coordinate["bottom_right"][2];
        top_x = bottom_x - 1 / width_ratio * corner_width;
    }
    if(top_y == capture.rows){
        let corner_height = "bottom_left" in bounding_coordinate? bounding_coordinate["bottom_left"][3] : bounding_coordinate["bottom_right"][3];
        top_y = bottom_y - 1 / height_ratio * corner_height;
    }
    if(bottom_x == 0){
        let corner_width = "top_left" in bounding_coordinate? bounding_coordinate["top_left"][2] : bounding_coordinate["bottom_left"][2];
        bottom_x = top_x + 1 / width_ratio * corner_width;
    }
    if(bottom_y == 0){
        let corner_height = "top_left" in bounding_coordinate? bounding_coordinate["top_left"][3] : bounding_coordinate["top_right"][3];
        bottom_y = top_y + 1 / height_ratio * corner_height;
    }
    
    /* Remove marker contours */
    let white_colour = new cv.Scalar(0, 0, 0, 0);
    let matVec = new cv.MatVector();
    Object.values(final_contour).forEach(function(item){
        matVec.push_back(item);
    });
    
    cv.drawContours(capture, matVec, -1, white_colour, -1);

    let marker_width = bottom_x - top_x;
    let marker_height = bottom_y - top_y;

    /* Clear all 4 corners. Clear whole adjacent lines. */
    if(!("top_left" in bounding_coordinate)){
        cv.rectangle(capture, new cv.Point(top_x, top_y), new cv.Point(bottom_x, top_y + height_ratio * marker_height / 3), white_colour, -1);
        cv.rectangle(capture, new cv.Point(top_x, top_y), new cv.Point(top_x + width_ratio * marker_width / 3, bottom_y), white_colour, -1);
    }
    if(!("top_right" in bounding_coordinate)){
        cv.rectangle(capture, new cv.Point(top_x, top_y), new cv.Point(bottom_x, top_y + height_ratio * marker_height  / 3), white_colour, -1);
        cv.rectangle(capture, new cv.Point(bottom_x - width_ratio * marker_width / 3, top_y), new cv.Point(bottom_x, bottom_y), white_colour, -1);
    }
    if(!("bottom_left" in bounding_coordinate)){
        cv.rectangle(capture, new cv.Point(top_x, top_y), new cv.Point(top_x + width_ratio * marker_width / 3, bottom_y), white_colour, -1);
        cv.rectangle(capture, new cv.Point(top_x, bottom_y - height_ratio * marker_height / 3), new cv.Point(bottom_x, bottom_y), white_colour, -1);
    }
    if(!("bottom_right" in bounding_coordinate)){
        cv.rectangle(capture, new cv.Point(bottom_x - marker_width * width_ratio / 3, top_y), new cv.Point(bottom_x, bottom_y), white_colour, -1);
        cv.rectangle(capture, new cv.Point(top_x, bottom_y - marker_height * height_ratio / 3), new cv.Point(bottom_x, bottom_y), white_colour, -1);
    }

    /* Get marker */
    let mask = cv.Mat.zeros(original_image.rows, original_image.cols, cv.CV_8U);
    cv.drawContours(mask, matVec, 0,  new cv.Scalar(255,255,255), -1)
    
    let marker = new cv.Mat();
    cv.bitwise_and(original_image, original_image, marker, mask);
    
    /* Crop */
    let rectangle = new cv.Rect(top_x, top_y, bottom_x - top_x, bottom_y - top_y);
    capture = capture.roi(rectangle);
    
    original_image = original_image.roi(rectangle);
    
    /* Trim Capture */
    let gray = new cv.Mat();
    cv.threshold(capture, gray, 160, 255, cv.THRESH_BINARY);
    
    let xPointArr=[];
    let yPointArr=[];

    for (let index = 0; index < gray.data.length; index++) {
        if(gray.data[index] == 255){
            xPointArr.push(index % gray.cols);
            yPointArr.push(Math.floor(index / gray.cols));
        }
    }

    let x = Math.min(...xPointArr), 
        y = Math.min(...yPointArr), 
        bx = Math.max(...xPointArr),
        by = Math.max(...yPointArr),
        w = bx - x + 1,
        h = by - y + 1;

    rectangle = new cv.Rect(x, y, w, h);
    capture = capture.roi(rectangle);
    
    cv.bitwise_not(capture, capture);
    
    let trim_original_image = new cv.Mat();
    
    trim_original_image = original_image.roi(rectangle);
    
    let dsize = new cv.Size(400, Math.round(400/w*h));
    cv.resize(trim_original_image, trim_original_image, dsize, 0, 0, cv.INTER_NEAREST);
    
    let black = 0, white = 0;

    for(let row = 0; row < capture.rows; row++){
        for(let col = 0; col < capture.cols; col++){
            if(capture.ucharAt(row,col) == 0)
                black++;
            if(capture.ucharAt(row,col) == 255)
                white++;
        }
    }

    return {trim_image: trim_original_image, 
            rectangle_image: original_image, 
            black_count: black, 
            white_count: white, 
            marker_image: marker,
            visible_corner: Object.keys(bounding_coordinate).length,
            marker_color: "green"
        }
}

function getMarkerPosition(contour){
    
    let {x, y, width, height} = cv.boundingRect(contour);
    let result = {"position":"None", "x":x, "y":y, "w": width, "h": height, "colour":""};

    let min_x = x;
    let min_y = y;
    let max_x = x + width;
    let max_y = y + height;

    /* 1) Make sure w and h has 90% similarities because it is a square */
    if(Math.abs(1-width/height) > 0.2 || width < 10){
        return result;
    }

    /* 2) Occupies at least 1/3 of rectangle of each edge. Ensure 90% of coordinates fall into this range else not valid contour. */
    /* Use counter measurement. Find 2/3 of the areas that has only a max of 10% of total coordinates. */
    
    let start_x = min_x + Math.round(width/3);
    let end_x   = min_x + (2 * Math.round(width/3));
    let start_y = min_y + Math.round(height/3);
    let end_y   = min_y + (2 * Math.round(height/3));
    
    let max_permitted = contour.rows * 0.1;

    /* At least 90 to return true */
    let empty_area_count = {
        "top_left": 0,
        "top_right": 0,
        "bottom_left": 0,
        "bottom_right": 0
    }
    
    for(let rowi = 0; rowi < contour.rows; rowi++){
        for(let coli = 0; coli < contour.cols; coli++){
            let point = contour.intPtr(rowi,coli);
            if(point[0] >= start_x && point[0] <= max_x+1 && point[1] >= start_y && point[1] <= max_y+1){
                empty_area_count["top_left"] += 1;
            }
            if(point[0] >= min_x && point[0] <= end_x+1 && point[1] >= start_y && point[1] <= max_y+1){
                empty_area_count["top_right"] += 1;
            }
            if(point[0] >= start_x && point[0] <= max_x+1 && point[1] >= min_y && point[1] <= end_y+1){
                empty_area_count["bottom_left"] += 1;
            }
            if(point[0] >= min_x && point[0] <= end_x+1 && point[1] >= min_y && point[1] <= end_y+1){
                empty_area_count["bottom_right"] += 1;
            }
        }
    }
    
    /* Remove element above max_permitted and get min value in dictionary */
    for (const [k, v] of Object.entries(empty_area_count)) {    
        if(v <= max_permitted && (result["position"] == "None" || v < empty_area_count[result["position"]])){
            result["position"] = k;
        }
    }
    
    return result;
}

function compareImageRatio(dbset, image){
    let data = {}
    let image_ratio = image.cols / image.rows;
    for(const [x, y] of Object.entries(dbset)){
        if ((Math.abs(image_ratio-y["dimension_ratio"]) / y["dimension_ratio"]) < 0.08){
            data[x] = y;
        }
    }   
    return data;
}

function compareFillRatio(dbset, ratio){
    data = {}
    for(const [x, y] of Object.entries(dbset)){
        if ((Math.abs(ratio-y["fill_ratio"]) / y["fill_ratio"]) < 0.15){
            data[x] = y;
        }
    }
    return data;
}

async function compareMinimumContour(dbset, rectangle_image){
    let data = {};
    cv.imshow("canvasOutput", rectangle_image)

    /* Minimum number of contour */
    

    /* 80% match contour with original marker */


    return data;
}

function compareVisibleCorner(dbset, visible_corner){
    data = {}
    for(const [x, y] of Object.entries(dbset)){
        if (visible_corner == y["visible_corner"]){
            data[x] = y;
        }
    }
    return data;
}

async function compareContour(dbset, image){
    let data = {};
    let capture = new cv.Mat();
    
    cv.cvtColor(image, capture, cv.COLOR_RGB2GRAY, 0);
    cv.threshold(capture, capture, 128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
    cv.threshold(capture, capture, 127, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C);
    
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(capture, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
    
    /* Loop thru dbset with width of 400 */
    for(const [x, y] of Object.entries(dbset)){

        const img = await getImage("./data/marker/" + y["file_name"]).catch((err) => {console.error(err)});
        
        if(img){
            let markerSrc = cv.imread(img);
            let capture_set = new cv.Mat();
            cv.cvtColor(markerSrc, capture_set, cv.COLOR_RGB2GRAY, 0);
            
            cv.threshold(capture_set, capture_set, 128, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
            cv.threshold(capture_set, capture_set, 127, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C);

            let contours_set = new cv.MatVector();
            let hierarchy_set = new cv.Mat();
            cv.findContours(capture_set, contours_set, hierarchy_set, cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
            
            let matchCount = 0;

            for(var i = 0; i < contours_set.size(); i++){
                for(var j = 0; j < contours.size(); j++){
                    if(cv.matchShapes(contours_set.get(i), contours.get(j), 1, 0) < 0.08){
                        matchCount++;
                        break;
                    }
                }
            }
            
            /* Delete marker images. */
            $("#" + img).remove();

            if(matchCount >= contours_set.size() - 1){
                data[x] = y;
            }
        }
    }
    
    return data;
}