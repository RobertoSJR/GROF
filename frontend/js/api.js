const API_KEY = 'f2e37ec6828244adbed8dfd8f9aa2335'
const BASE_URL = 'https://newsapi.org/v2'

export asysnc function getNews(){
    try {
        const getNewsDataApi = await
        fetch('${BASE_URL}'/top-headlines?country=us&apikey=${APY_KEY})
        return getNewsDataApi.json()
    } catch (error){
        console.log (error)
    }
}