

export function totalReps(workout){
    let keys = Object.keys(workout)
    keys = keys.filter(key =>{
        return key.includes('reps')
    })

    let total = 0
    for(let i = 0; i<keys.length; i++){
        let reps = parseInt(workout[keys[i]])
        if(!isNaN(reps)){
            total = total + reps
        } 
    }
    return total
}

export function totalWeight(workout){
    let keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('weight'))

    let total = 0
    for(let i = 0; i<keys.length; i++){
        let weight = parseInt(workout[keys[i]])
        if(!isNaN(weight)){
            total = total + parseInt(workout[keys[i]])
        }
        
    }
    return total
}

export function totalSets(workout){
    let keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('Set'))

    return Math.floor(keys.length/2)
}

export function calculate1RM(weight, reps){
    if(isNaN(weight)){
        return 0
    }
    if(isNaN(reps)){
        return 0
    }
    if(reps > 20 || reps < 0){
        return 0
    }

    let formula = {
        1:'1',
        2:'.97',
        3:'.94',
        4:'.92',
        5:'.89',
        6:'.86',
        7:'.83',
        8:'.81',
        9:'.78',
        10:'.75',
        11:'.73',
        12:'.71',
        13:'.70',
        14:'.68',
        15:'.67',
        16:'.65',
        17:'.65',
        18:'.63',
        19:'.61',
        20:'.60',
    }
    return Math.floor(weight/formula[reps])
}

export function max3Lifts(workout){
    let bench1rm = 0
    let squat1rm = 0
    let deadlift1rm = 0


    let keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('Bench'))
    keys = keys.filter(key => !key.includes('notes'))

    for(let i = 0; i<keys.length; i += 2){
        let projected = calculate1RM(parseInt(workout[keys[i]]) , parseInt(workout[keys[i+1]]))
        if(bench1rm < projected){
            bench1rm = projected
        }
    }

    keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('Squat'))
    keys = keys.filter(key => !key.includes('notes'))

    for(let i = 0; i<keys.length; i += 2){
        let projected = calculate1RM(parseInt(workout[keys[i]]) , parseInt(workout[keys[i+1]]))
        if(squat1rm < projected){
            squat1rm = projected
        }
    }

    keys = Object.keys(workout)
    keys = keys.filter((key) => key.includes('Deadlift'))
    keys = keys.filter((key) => !key.includes('notes'))

    for(let i = 0; i<keys.length; i += 2){
        let projected = calculate1RM(parseInt(workout[keys[i]]) , parseInt(workout[keys[i+1]]))
        if(deadlift1rm < projected){
            deadlift1rm = projected
        }
    }

    let max = {bench:bench1rm, squat:squat1rm, deadlift:deadlift1rm}
    return max
}

export function getSetsRepsWeight(workout, excercise){
    let sets = 0
    let reps = 0
    let weight = 0

    let keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('Set'))
    keys = keys.filter(key => key.includes(excercise))

    sets = Math.floor(keys.length/2)

    keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('reps'))
    keys = keys.filter(key => key.includes(excercise))
    for(let i = 0; i<keys.length; i++){
        let new_reps = parseInt(workout[keys[i]])
        if(!isNaN(new_reps)){
            reps = reps + new_reps
        }
    }

    keys = Object.keys(workout)
    keys = keys.filter(key => key.includes('weight'))
    keys = keys.filter(key => key.includes(excercise))
    for(let i = 0; i<keys.length; i++){
        let new_weight = parseInt(workout[keys[i]])
        if(!isNaN(new_weight)){
            weight = weight + new_weight
        }
    }

    let stats = {total_sets:sets, total_reps:reps, total_weight:weight}
    return stats
}