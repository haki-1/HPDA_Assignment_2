import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class ParallelCoordinatesD3 {
    margin = {top: 100, right: 50, bottom: 50, left: 50};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    // cellSize= 34;
    // radius = this.cellSize / 2;
    // colorScheme = d3.schemeYlGnBu[9];
    // cellColorScale = d3.scaleQuantile(this.colorScheme);
    // cellSizeScale = d3.scaleLinear()
    //     .range([2, this.radius-1])
    // ;
    axes;


    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // adapt the size locally if necessary
        // e.g. to create a square svg
        // if (this.size.width > this.size.height) {
        //     this.size.width = this.size.height;
        // } else {
        //     this.size.height = this.size.width;
        // }

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;


    }

    updateFunction1(selection){
        // transform selection
        // selection.attr("transform", (itemData)=>{
        //      // use scales to return shape position from data values
        // })

        // change sub-element
        // selection.select(".classname")
        //    .attr("fill",(itemData)=>{
        //          // use scale to return visual attribute from data values
        //    })
    }

    gimmeValue = function(visData, attribute, value){
        if(attribute == "Date") {return new Date(value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));}
        if(attribute == "Seasons") {if (value =="Winter") return 1; if (value == "Spring") return 2; if (value == "Summer") return 3; if (value == "Autumn") return 4;}
        if(attribute == "Holiday") {if (value == "No Holiday") return 1; if (value == "Holiday") return 2;}
        if(attribute == "FunctioningDay") {if (value == "No") return 1; if (value == "Yes") return 2;}
        return value;
    };

    // tuka pravq x-ovete i y scale
    updateAxis = function(visData){
        //const keys = Object.keys(visData[0])
                        const keys = Object.keys(visData[0]);
                        keys.splice(keys.indexOf("Index"), 1);
                        // const visDataCpy = visData.forEach(function(v){ delete v.Index });

        // Create an horizontal (*x*) scale for each key.
        const x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(visData, d => this.gimmeValue(visData,key,d[key])), [0,this.width])]));

        // Create the vertical (*y*) scale.
        const y = d3.scalePoint(keys, [this.height,0]);

        // Create the color scale.
        // const color = d3.scaleSequential(x.get(keyz).domain(), t => d3.interpolateBrBG(1 - t));

        // Create the SVG container.
        // const svg = d3.create("svg")
        //     .attr("viewBox", [0, 0, width, height])
        //     .attr("width", width)
        //     .attr("height", height)
        //     .attr("style", "max-width: 100%; height: auto;");

        // Append the axis for each key.
        this.axes = this.matSvg.append("g")
        .selectAll("g")
        .data(keys)
        .join("g")
            .attr("transform", d => `translate(0,${y(d)})`)
            .each(function(d) { d3.select(this).call(d3.axisBottom(x.get(d))); })
            .call(g => g.append("text")
            .attr("x", 0)
            .attr("y", -6)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .text(d => d))
            .call(g => g.selectAll("text")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round")
            .attr("stroke", "white"));

    }

    renderVis = function (visData, controllerMethods){
        
        // build the size scale from the data
        // const minVal =
        // const maxValo =
        // this.scale1.domain([minVal, maxVal])
        if (visData.length > 0)
            { 
                this.updateAxis(visData); 
                const x = new Map(Array.from(Object.keys(visData[0]), key => [key, d3.scaleLinear(d3.extent(visData, d => this.gimmeValue(visData,key,d[key])), [0,this.width])]));
                const color = d3.scaleSequential(x.get("RentedBikeCount").domain(), t => d3.interpolateSpectral(1 - t));
            
            
        this.matSvg.selectAll(".itemG")
            // all elements with the class .cellG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","itemG")
                        .on("event1", (event,itemData)=>{
                            controllerMethods.handleOnEvent1(itemData);
                        })
                        .on("event2",(event,itemData)=>{
                            controllerMethods.handleOnEvent2(itemData);
                        })
                    ;
                    // render element as child of each element "g"
                    itemG.append("shape")
                    // ...
                    ;
                    this.updateFunction1(itemG);

                    // tuka chertaq liniite
                    if (visData.length > 0) {
                        const keys = Object.keys(visData[0]);
                        keys.splice(keys.indexOf("Index"), 1);
                        // const visDataCpy = visData.forEach(function(v){ delete v.Index });

                        // const keys = Object.keys(visData[0]);
                        const x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(visData, d => this.gimmeValue(visData, key, d[key])), [0,this.width])]));
                        const y = d3.scalePoint(keys, [this.height,0]);

                        const line = d3.line()
                            .defined(([, value]) => value != null)
                            .x(([key, value]) => x.get(key)(value))
                            .y(([key]) => y(key));

                        const path = this.matSvg.append("g")
                            .attr("fill", "none")
                            .attr("stroke-width", 1.5)
                            .attr("stroke-opacity", 0.4)
                            .selectAll("path")
                            .data(visData.slice().sort())
                            .join("path")
                            .attr("stroke", d => color(this.gimmeValue(visData, "RentedBikeCount", d["RentedBikeCount"])))
                            .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, this.gimmeValue(visData, key, d[key])])))
                            .append("title")
                            .text(d => d.name); 
                          // Create the brush behavior.
                            const deselectedColor = "#ddd";
                            const brushHeight = 50;
                            const brush = d3.brushX()
                                .extent([
                                    [0, -(brushHeight / 2)],
                                    [this.width - 0, brushHeight / 2]
                                ])
                                .on("start brush end", brushed);

                            this.axes.call(brush);

                            const selections = new Map();
                            
                            function brushed({selection}, key) { 
                                if (selection === null) selections.delete(key);
                                else selections.set(key, selection.map(x.get(key).invert));
                                const selected = [];
                                
                                path.each(function(d) {
                                const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
                                d3.select(this).style("stroke", active ? "red" : deselectedColor);
                                if (active) {
                                    d3.select(this).raise();
                                    selected.push(d);
                                }
                                });
                                // this.matSvg.property("value", selected).dispatch("input");
                            }
                        }
                },
                update=>{this.updateFunction1(update)},
                exit =>{
                    exit.remove()
                    ;
                }

            )
        }
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ParallelCoordinatesD3;