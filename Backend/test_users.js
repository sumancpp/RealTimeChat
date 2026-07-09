import axios from 'axios';
async function test() {
    try {
        const res = await axios.get('http://localhost:8000/message/sorted-users', {
            headers: {
                Cookie: "token=test"
            }
        });
        console.log("SUCCESS:", res.data);
    } catch(err) {
        console.log("ERROR:", err.response?.status, err.message);
    }
}
test();
