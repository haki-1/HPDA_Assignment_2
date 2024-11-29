import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class ParallelCoordinatesD3 {
    margin = {top: 100, right: 5, bottom: 50, left: 100};
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
    xScales;
    yScale;
    brush;
    lineColorScale;
    selections;


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

    updateAxis = function(keys){
        const x = this.xScales;
        const axes = this.matSvg.append("g")
            .selectAll("g")
            .data(keys)
            .join("g")
                .attr("transform", d => `translate(0,${this.yScale(d)})`)
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
            
        return axes;

    }


    renderParallelCoordinates = function (visData, keys, attributeForColorScale, controllerMethods){
        // build the size scale from the data
        // const minVal =
        // const maxValo =
        // this.scale1.domain([minVal, maxVal])

        this.xScales = new Map(Array.from(keys, key => key === "Date" ? [key, d3.scaleTime(d3.extent(visData, d => d[key]), [0,this.width])] : [key, d3.scaleLinear(d3.extent(visData, d => d[key]), [0,this.width])]));
        this.yScale = d3.scalePoint(keys, [this.height, 0]);
        this.color = d3.scaleSequential(this.xScales.get(attributeForColorScale).domain(), t => d3.interpolateTurbo(t));
        const line = d3.line()
        .defined(([,value]) => value != null)
        .x(([key, value]) => this.xScales.get(key)(value))
        .y(([key]) => this.yScale(key));
        
        this.matSvg.selectAll(".lineG")
            // all elements with the class .cellG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","lineG")
                    ;
                    // render element as child of each element "g"
                    itemG.append("path")
                        .attr("class", "linePath")
                        .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])))
                        .attr("fill", "none")
                        .attr("stroke", d => this.color(d[attributeForColorScale]))
                        .attr("stroke-opacity", 0.4)
                    // ...
                    ;
                    this.updateFunction1(itemG);
                },
                update=>{this.updateFunction1(update)},
                exit =>{
                    exit.remove()
                    ;
                }

            )

        const axes = this.updateAxis(keys);
        this.selections = new Map();
        this.brush = axes.call(d3.brushX()
            .extent([
                [0,-25],
                [this.width,25]
            ])
            .on("start brush end", ({selection}, key) => {
                if (selection === null) this.selections.delete(key);
                else this.selections.set(key, selection.map(this.xScales.get(key).invert));
                this.matSvg.selectAll(".lineG").select("path")
                    .attr("stroke", d => Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max) ? this.color(d[attributeForColorScale]) : "#ddd")
                    .attr("stroke-opacity", d => Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max) ? 0.4 : 0.02)
            }).on("end", ({selection}, key) => {
                if (selection === null) this.selections.delete(key);
                else this.selections.set(key, selection.map(this.xScales.get(key).invert));
                let selected = [];
                selected = this.matSvg.selectAll(".lineG").select("path")
                    .attr("stroke", d => Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max) ? this.color(d[attributeForColorScale]) : "#ddd")
                    .attr("stroke-opacity", d => Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max) ? 0.4 : 0.02)
                    .filter(d => Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max))
                    .data();
                controllerMethods.handleOnBrushEnd(selected);
        }));
    }

    renderParallelCoordinatesOnSelectionChange = function (selectedData, attributeForColorScale){
        if (selectedData.visValue == 1) {
            this.brush.call(d3.brushX().clear);
            this.selections.clear();
            this.matSvg.selectAll(".lineG").select("path")
                .attr("stroke", d => d3.some(selectedData.data, x => d.index == x.index) ? this.color(d[attributeForColorScale]) : "#ddd")
                .attr("stroke-opacity", d => d3.some(selectedData.data, x => d.index == x.index) ? 0.4 : 0.02);

            // this.matSvg.selectAll(".dotG").select(".dotCircle").attr("stroke", d => d3.some(selectedData.data, x => d.index == x.index) ? "steelblue" : "gray");
        }
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ParallelCoordinatesD3;