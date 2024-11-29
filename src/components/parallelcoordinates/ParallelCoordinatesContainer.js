import './ParallelCoordinates.css'
import { useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux'

import ParallelCoordinatesD3 from './ParallelCoordinates-d3';
import {updateSelection} from "../../redux/SelectedDataSlice";

// TODO: import action methods from reducers

function ParallelCoordinatesContainer(){
    const dataSetData = useSelector(state =>state.dataSet)
    const selectedDataData = useSelector(state =>state.selectedData)
    const dispatch = useDispatch();

    const xAttributes= ["Date", "Hour", "RentedBikeCount", "Temperature", "Humidity", "WindSpeed", "Visibility", "DewPointTemperature", "SolarRadiation"]
    const attributeForColorScale= "RentedBikeCount"

    // every time the component re-render
    useEffect(()=>{
        console.log("ParallelCoordinatesContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divContainerRef=useRef(null);
    const parallelCoordinatesD3Ref = useRef(null)

    const getCharSize = function(){
        // fixed size
        // return {width:900, height:900};
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            // width = '100%';
            height=divContainerRef.current.offsetHeight;
            // height = '100%';
        }
        return {width:width,height:height};
    }

    // did mount called once the component did mount
    useEffect(()=>{
        console.log("ParallelCoordinatesContainer useEffect [] called once the component did mount");
        const parallelCoordinatesD3 = new ParallelCoordinatesD3(divContainerRef.current);
        parallelCoordinatesD3.create({size:getCharSize()});
        parallelCoordinatesD3Ref.current = parallelCoordinatesD3;
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ParallelCoordinatesContainer useEffect [] return function, called when the component did unmount...");
            const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current;
            parallelCoordinatesD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ParallelCoordinatesContainer useEffect with dependency [dataSetData,dispatch], called each time dataSetData changes...");
        const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current;

        const handleOnBrushEnd = function(payload){
            dispatch(updateSelection({visValue:2, data:payload}));
        }
        const controllerMethods={
            handleOnBrushEnd: handleOnBrushEnd,
        }
        parallelCoordinatesD3.renderParallelCoordinates(dataSetData,xAttributes,attributeForColorScale,controllerMethods);
    },[dataSetData,dispatch]);// if dependencies, useEffect is called after each data update, in our case only dataSetData changes.

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ParallelCoordinatesContainer useEffect with dependency [selectedDataData,dispatch], called each time selectedDataData changes...");
        const parallelCoordinatesD3 = parallelCoordinatesD3Ref.current;
        parallelCoordinatesD3.renderParallelCoordinatesOnSelectionChange(selectedDataData,attributeForColorScale);
    },[selectedDataData,dispatch]);// if dependencies, useEffect is called after each data update, in our case only selectedDataData changes.    

    return(
        <div ref={divContainerRef} className="parallelCoordinatesDivContainer col2">

        </div>
    )
}

export default ParallelCoordinatesContainer;